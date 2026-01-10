---
title: How I Set Up A Media Server with Proxmox, Mergerfs, and SnapRAID
# description: This is all very legal.
pubDate: 2025-03-15
tags:
  - homelab
draft: false
---
Alex from KTZ Systems published an [in-depth Proxmox installation tutorial](https://perfectmediaserver.com/03-installation/manual-install-proxmox/). The following is a condensed version for my purposes.

Proxmox
---

Download the Proxmox iso [here](). Run the following commands to verify the checksum:
```bash
shasum -a 256 ~/Downloads/proxmox-ve_8.2-2.iso  # verify checksum
```

Flash it to a USB drive and then boot from it. During the setup process, you'll be asked to specify several things like the hostname, IP address, and an email address. The hostname is just something for proxmox to use internally. I usually go with something like `rackchoice.local` since it does require a full FDQN name.

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


If you have any lingering SSH keys from previous installs, run these commands on your mac or whatever system you may have used to connect.

```sh
# clear any existing ssh keys for your server's hostname or IP address
ssh-keygen -R rackhoice  

# copy public key from mac to server 
ssh-copy-id dominic@rackchoice 
```

Mergerfs
---
Log in as your new user if you haven't already.

The command below pulls down the latest version of mergerfs from github instead of relying on the apt repository. You can run it however often you want. If you already have the latest version, it will do nothing.
```sh
curl -s https://api.github.com/repos/trapexit/mergerfs/releases/latest | grep "browser_download_url.*$(grep VERSION_CODENAME /etc/os-release | cut -d= -f2)_$(dpkg --print-architecture).deb\"" | cut -d '"' -f 4 | wget -qi - && sudo dpkg -i mergerfs_*$(grep VERSION_CODENAME /etc/os-release | cut -d= -f2)_$(dpkg --print-architecture).deb && rm mergerfs_*.deb

```

I also like to put the command in a `update_mergerfs.sh` script and set it to run every 3 months at 3AM on a cron job:
```
0 3 1 */3 * /home/dominic/update_mergerfs.sh
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

Take note of the mappings as I did [[Rackchioice#Identifying Disks|here]]. We'll need them for our `etc/fstab`.

Run `sudo su` to switch user to `root`. 

For new drives (no pre-existing data you want to keep), run `gdisk /dev/sdX` where `X` is the drive you want to format. This will drop you into an interactive session. Follow these instructions:

* *o* - (creates a new empty GPT partition table)
    * `Proceed? (Y/N)` - *`Y`*
* *n* - (creates a new partition)
    * `Partition number (1-128, default 1):` `1`
    * `First sector (34-15628053134, default = 2048) or {+-}size{KMGTP}:` *leave blank*
    * `Last sector (2048-15628053134, default = 15628053134) or {+-}size{KMGTP}:` *leave blank*
    * `Hex code or GUID (L to show codes, Enter = 8300):` *8300*
* *p* - (optionally validate that 1 large partition is to be created)
    * `Model: HGST HDN728080AL`
    * `Number  Start (sector)    End (sector)  Size       Code  Name`
    * `1       2048              15628053134   7.3 TiB    8300  Linux filesystem`
* *w* - (writes the changes made thus far)
    * Until this point, gdisk has been non-destructive
    * Confirm that making these changes is OK and the changes queued so far will be executed

After you have done that for all your drives, create an `ext4` filesystem on each drive's newly created partition: ```
``` 
mkfs.ext4 /dev/sdX1
```

Now we can create mountpoints for our new partitions:
```sh
mkdir /mnt/disk{1,2}  # or however many you need
mkdir /mnt/parity1  # adjust this command based on your parity setup
mkdir /mnt/storage  # this will be the main mergerfs mountpoint
```

Finally, we can edit `/etc/fstab` to tell our OS to mount our new partitions to our newly created mountpoints. This will run every time our machine boots. [[Rackchioice#`/etc/fstab`|Here]] is mine for Rackchoice. The last line is essentially the `mergerfs` config. 

In order to reload the new fstab entries you've created and check them before rebooting, use `mount -a`. Then verify the mount points with `df -h`. If you had any existing files on your data disks they will be visible under `/mnt/storage`.

Now's as good a time as any to change the owner of your new mergerfs pool to `dominic` so that when you start using samba, you have write and read permissions at the Debian level:
```sh
sudo chown -R dominic:dominic /mnt/storage/
```

Samba
---
Install samba:
```sh
sudo apt install samba
```

Create/edit the samba config at `/etc/samba/smb.conf`. Mine is documented [[Rackchioice#`/etc/samba/smb.conf`|here]].

Samba requires setting a password separately from that used for login. You may use an existing user or create a new one for this purpose.
```sh
sudo smbpasswd -a dominic
sudo systemctl restart smbd
```


Docker
---
Install docker: 
```
curl -fsSL https://get.docker.com | sh
```

Check your user's `uid` and `gid`:
```sh
id dominic
```
You'll need this info when setting up containers.


Jellyfin
---
Linuxserver.io has a [Jellyfin image](https://docs.linuxserver.io/images/docker-jellyfin/) with instructions on how to set it up.

My `docker-compose.yml` can be found [[Rackchioice#`docker-compose.yml`|here]]. 

Run `docker compose version` to make sure you have docker compose on your server.

Then make sure you have created a folder for your jellyfin files (config, cache, etc) to live.
```sh
mkdir /home/dominic/jellyfin
chown -R 1000:1000 /home/dominic/jellyfin
```

I had to run the following commands to add my user to the docker group so that I could run docker commands without being root:
```sh
groups dominic
sudo usermod -aG docker dominic
```

I also had to log out and log back in.

Then make sure your `docker-compose.yml` file is in your `jellyfin` directory and run `docker compose up -d` from the `jellyfin` directory.

You should now be able to setup Jellyfin at the server's IP address on port `8096`.


