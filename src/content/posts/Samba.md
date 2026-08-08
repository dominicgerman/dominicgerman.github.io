---
title: Samba shares
pubDate: 2026-01-14
tags:
  - homelab
draft: false
---
Samba is Microsoft's free implementation of the SMB (Server Message Block) communication protocol. I use it for sharing files between devices on my network as it runs on just about any OS. It's permissions system is a little quirky since it uses Windows-style ACLs.

To install it on Linux, run this command as root.

```sh
apt install samba
```

Then configure your Samba shares. Here's the `/etc/samba/smb.conf` file for my NAS.

```ini
[global]
    workgroup = DCG
    netbios name = nas 
    server string = Primary Storage Server 
    security = user 
    log file = /var/log/samba/%m.log 
    max log size = 50 
    printcap name = /dev/null 
    load printers = no 
    server min protocol = SMB2
    unix extensions = no
    ea support = yes
    aio read size = 1
    aio write size = 1
    vfs objects = catia fruit streams_xattr
    fruit:advertise_fullsync = true
    fruit:time machine = yes
    fruit:encoding = native 
    fruit:zero_file_id = yes 
    fruit:metadata = stream 
    vfs objects = catia fruit streams_xattr 
    fruit:nfs_aces = no

[home]
    comment = Home directory for dominic
    path = /home/dominic
    browseable = yes
    read only = no
    guest ok = no

[media]
    comment = Media storage
    path = /dpool/media
    browseable = yes
    writeable = yes
    read only = no
    guest ok = no

[timemachine] 
    comment = Time Machine 
    path = /dpool/timemachine 
    browseable = yes 
    writable = yes 
    public = no 
    guest ok = no 
    fruit:time machine = yes 
    fruit:resource = stream 
    spotlight = no
    fruit:time machine max size = 2T
```

There's a lot of extra stuff in that config to make macOS happy. There's even some redundant lines in there but it's supposedly better than omitting them.

After that, set a "samba" password for your user and restart the daemon.

```sh
smbpasswd -a dominic && systemctl restart smbd
```

I also like to create a credentials file for Samba. This comes in handy when auto-mounting Samba shares in an `/etc/fstab` file.

```ini
username=dominic
password=changeme
```