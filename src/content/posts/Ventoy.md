---
title: Ventoy
pubDate: 2024-12-10
tags:
  - homelab
draft: false
---
## Overview

---
Ventoy is a free and open-source utility used for creating bootable USB media storage devices. It allows you to add multiple different operating system images to one USB drive and boot from them directly without reformatting the drive each time.

## Installation

---
Go to the [Ventoy official website](https://www.ventoy.net) and download the latest version for your operating system. I download the `ventoy-1.0.99-linux.tar.gz` file as I was doing this from a linux machine.

I then ran `sha256sum ventoy-1.0.99-linux.tar.gz` from the directory that contained my downloaded file. You'll want to compare the output of that command to the SHA-256 checksum for the file you downloaded. This will usually be listed alongside the download link or in a separate text file.

I then inserted the USB drive I wanted to use as my Ventoy drive. I ran `lsblk` to identify it. In my case, the drive was called `sda`. I needed to mount it so I ran the following commands: the first creates a new directory for mounting the partition and the second mounts the partition:

```bash
sudo mkdir -p /mnt/usb1
sudo mount /dev/sda1 /mnt/usb1
```

This is what I saw after running `lsblk`

```txt
NAME                      MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda                         8:16   1 116.1G  0 disk
└─sda1                      8:17   1 116.1G  0 part /mnt/usb1
```

I then expanded the Ventoy tarball and navigated into the new `ventoy-1.0.99` directory:

```bash
tar -xzf ventoy-1.0.99-linux.tar.gz 
cd ventoy-1.0.99
```

Lastly, I ran the Ventoy install script:

```bash
sudo ./Ventoy2Disk.sh -i /dev/sda
```

## Conclusion

---
If everything went well, you should have a newly formatted `/dev/sda` drive with a Ventoy partition mounted at `/mnt/usb1`. From here, you can copy as many isos as you want to the Ventoy partition. If you're like me, you'll also label your dedicated "Ventoy" drive appropriately so you don't get it mixed up with others.