# How to Set Up a Media Server

Alex from KTZ Systems has an [in-depth installation tutorial](https://perfectmediaserver.com/03-installation/manual-install-proxmox/){: target="_blank" } for his "Perfect Media Server". The following is essentially a condensed version for my purposes.

## Proxmox

---
Download the Proxmox iso [here](https://www.proxmox.com/en/downloads){: target="_blank" }. After the iso is in your downloads folder, run the following command to verify the checksum:

```sh
shasum -a 256 ~/Downloads/proxmox-ve_8.2-2.iso  # verify checksum
```

Flash it to a USB drive and then boot from it. During the setup process, you'll be asked to specify several things like the hostname, IP address, and an email address. The hostname is just something for proxmox to use internally. I usually go with something like `my-server-name.local` since it does require a full FDQN name.

Run the Proxmox VE Helper Script to disable enterprise features like HA and the subscription nag among other things:

```sh
bash -c "$(wget -qLO - https://github.com/community-scripts/ProxmoxVE/raw/main/misc/post-pve-install.sh)"
```

Now is a good time to install `sudo` and `vim:

```sh
apt update
apt install sudo
apt install vim 
```

Add a user for yourself:

```sh
useradd -m -s /bin/bash dominic   
```

Give yourself a password

```sh
passwd dominic
```

Put yourself in the sudo group:

```sh
usermod -aG sudo dominic
```

Give yourself some special proxmox permissions:

```sh
pveum useradd dominic@pve -comment "New Admin User"
pveum aclmod / -user dominic@pve -role Administrator
```

!!! info "Optional: Transfer SSH key"

    You likely already have an ssh key on your personal computer. If you're on a Mac, you can run the following commands from your Mac's terminal so that you can log into your server without a password:
    ```sh
    # clear any existing ssh keys for your server's hostname or IP address
    ssh-keygen -R <your-hostname-or-ip>

    # copy public key from mac to server 
    ssh-copy-id <your-user>@<your-hostname-or-ip>
    ```

## Mergerfs

---
Log into your server via SSH as your new user if you haven't already.

```sh
ssh dominic@rackchoice
```

The command below pulls down the latest version of mergerfs from Github instead of relying on the apt repository which tends to lag behind the latest release. You can run it however often you want. If you already have the latest version, it will do nothing.

```sh
curl -s https://api.github.com/repos/trapexit/mergerfs/releases/latest | grep "browser_download_url.*$(grep VERSION_CODENAME /etc/os-release | cut -d= -f2)_$(dpkg --print-architecture).deb\"" | cut -d '"' -f 4 | wget -qi - && sudo dpkg -i mergerfs_*$(grep VERSION_CODENAME /etc/os-release | cut -d= -f2)_$(dpkg --print-architecture).deb && rm mergerfs_*.deb
```

I also like to put the command in an `update_mergerfs.sh` script and set it to run every 3 months at 3AM on a cron job. Run `sudo crontab -e` to open the crontab for the root user and then add the following line to the end of the file:

```txt
0 3 1 */3 * /path/to/your/update_mergerfs.sh
```

Install `inxi` to identify your drives.

```sh
sudo apt install inxi
inxi -xD  # list drives
ls /dev/disk/by-id # list drives by their immutable ids
```

Then identify the current `sdX` mappings for each drive:

```sh
ls -la /dev/disk/by-id/ata-ST400VN006-3CW104_ZW62V162  # for example
/dev/disk/by-id/ata-ST4000VN006-3CW104_ZW62V162 -> ../../sdb # output
```

Take note of the mappings. We'll need them for our `etc/fstab`.

Run `sudo su` to switch user to `root`.

For new drives (no pre-existing data you want to keep), run `gdisk /dev/sdX` where `X` is the drive you want to format. This will drop you into an interactive session. Follow these instructions:

```txt
Press `o` to create a new empty GPT partition table
  * Proceed? (Y/N) - Y
Press `n` to create a new partition
  * Partition number (1-128, default 1): 1
  * First sector (34-15628053134, default = 2048) or {+-}size{KMGTP}: <leave blank>
  * Last sector (2048-15628053134, default = 15628053134) or {+-}size{KMGTP}: <leave blank>
  * Hex code or GUID (L to show codes, Enter = 8300): 8300
Press `p` to validate that 1 large partition is to be created
  * Model: HGST HDN728080AL
  * Number  Start (sector)    End (sector)  Size       Code  Name
  * 1       2048              15628053134   7.3 TiB    8300  Linux filesystem
Press `w` to write the changes made thus far
  * Until this point, gdisk has been non-destructive
  * Confirm that making these changes is OK and the changes queued so far will be executed
```

After you have done that for all your drives, create an `ext4` filesystem on each drive's newly created partition with `mkfs.ext4 /dev/sdX1`.

Now we can create mountpoints for our new partitions:

```sh
mkdir /mnt/disk{1,2}  # or however many you need
mkdir /mnt/parity1  # adjust this command based on your parity setup
mkdir /mnt/storage  # this will be the main mergerfs mountpoint
```

Finally, we can edit `/etc/fstab` to tell our OS to mount our new partitions to our newly created mountpoints. This will run every time our machine boots. Here's an example:

```txt title="/etc/fstab" linenums="1"
/dev/disk/by-id/ata-WDC_WD100EMAZ-00WJTA0_16G0Z7RZ-part1 /mnt/parity1 ext4 defaults 0 0
/dev/disk/by-id/ata-WDC_WD100EMAZ-00WJTA0_16G10VZZ-part1 /mnt/disk1   ext4 defaults 0 0
/dev/disk/by-id/ata-WDC_WD100EMAZ-00WJTA0_2YHV69AD-part1 /mnt/disk2   ext4 defaults 0 0

/mnt/disk* /mnt/storage fuse.mergerfs defaults,nonempty,allow_other,use_ino,cache.files=off,moveonenospc=true,dropcacheonclose=true,minfreespace=200G,fsname=mergerfs 0 0
```

The last line is essentially your `mergerfs` config. You can read more about each option [here](https://trapexit.github.io/mergerfs/config/options/){: target="_blank" }.

In order to reload the new fstab entries you've created and check them before rebooting, use `mount -a`. Then verify the mount points with `df -h`. If you had any existing files on your data disks they will be visible under `/mnt/storage`.

Now's as good a time as any to change the owner of your new mergerfs pool to your non-root user so that when you start using samba and docker, you have write and read permissions at the Debian level:

```sh
sudo chown -R dominic:dominic /mnt/storage/
```

## Samba

---
Install samba:

```sh
sudo apt install samba
```

Create/edit the samba config at `/etc/samba/smb.conf`. Here's an example:

```ini title="/etc/samba/smb.conf" linenums="1"
[global]
    workgroup = DCG
    server string = rackchoice
    security = user
    guest ok = yes
    map to guest = Bad Password
    log file = /var/log/samba/%m.log
    max log size = 50
    printcap name = /dev/null
    load printers = no
  

# Samba Shares
[home]
    comment = dominic home folder
    path = /home/dominic
    browseable = yes
    read only = no
    guest ok = no

[storage]
    comment = Primary Storage
    path = /mnt/storage
    browseable = yes
    read only = no
    guest ok = yes
```

Samba requires setting a password separately from that used for login. You may use an existing user or create a new one for this purpose.

```sh
sudo smbpasswd -a dominic
sudo systemctl restart smbd
```

## Docker

---
Install docker:

```sh
curl -fsSL https://get.docker.com | sh
```

Check your user's `uid` and `gid` as well as the groups they are in:

```sh
id dominic
groups dominic
```

I needed to add my user to the docker group so that I could run docker commands without being root:

```sh
sudo usermod -aG docker dominic
```

!!! note

    You'll have to log out and log back in for those changes to take effect.

## Jellyfin

---
Linuxserver.io has a [Jellyfin image](https://docs.linuxserver.io/images/docker-jellyfin/){: target="_blank" } with instructions on how to set it up.

Create a folder for your jellyfin files (config, cache, etc) to live. I just used my user's home folder since it's on a fast SSD and there's plenty of space.

```sh
mkdir /home/dominic/jellyfin
chown -R 1000:1000 /home/dominic/jellyfin
```

Then create a `docker-compose.yml` in the `jellyfin` folder. Here's mine:

```yaml title="docker-compose.yml" linenums="1"
services:
  jellyfin:
    image: lscr.io/linuxserver/jellyfin:latest
    container_name: jellyfin
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
      - JELLYFIN_PublishedServerUrl=http://192.168.1.204
    volumes:
      - /home/dominic/jellyfin:/config
      - /mnt/storage/media/tv:/data/tvshows
      - /mnt/storage/media/movies:/data/movies
    ports:
      - 8096:8096
    restart: unless-stopped
```

Run `docker compose version` to make sure you have docker compose on your server.

Then from your `jellyfin` directory, run `docker compose up -d` to start the app.

You should now be able to setup Jellyfin at the server's IP address on port `8096`.

## SnapRAID

---
***Coming soon!***
