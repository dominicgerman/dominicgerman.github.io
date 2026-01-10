---
title: Installing Arch Linux on an Old ThinkPad
# description: I use Arch btw.
pubDate: 2025-01-23
tags:
  - linux
  - homelab
draft: false
---

Last year, I installed Arch Linux on an old Lenovo ThinkPad. I did this for a few reasons:

1. I wanted to deepen my knowledge of Linux but also computers more generally.
2. A lot of developers I respect have given up on Mac and Windows in favor of using Linux.
3. I was curious as to how much I could get done with a stripped down Linux machine.

I found an old Lenovo ThinkPad on Facebook Marketplace and bought it. For $200, I got a laptop with a 7th gen Core-i5, a 256GB SSD, and 16GB of memory. It also had two batteries installed and came with a power adapter so that was nice. I started by following [a tutorial](https://www.youtube.com/playlist?list=PL_JVnPgp2IRcFnHqZdmQwWdv8n49vGHqp) for the main installation but eventually abandoned it in favor of the [Arch wiki](https://wiki.archlinux.org/title/Installation_guide) and ChatGPT. Below are some of the things I learned along the way.

## Disk partitioning and encryption with LUKS
---
After downloading the ISO and adding it to [my Ventoy drive](/posts/8), I booted into Arch, made sure I had a network connection, and made sure the OpenSSH daemon was running. Then I ssh'd into the ThinkPad from my Mac.

 After using `fdisk` to create partitions,  I ran `lvcreate -L 32G archie1 -n root` to create a logical volume for root and `lvcreate -l 100%FREE archie1 -n home` to use the rest of my disk for the home directory. I then created the filesystems per the docs. I went with `ext4` since I didn't need the features of something like `zfs`. For the boot partition, I ran `mkfs.fat -F32 /dev/nvme0n1p1` to make a fat32 file system. Then I mounted my boot partition with `mount --mkdir /dev/nvme0n1p1 /mnt/boot`. 

I won't go into the details of encrypting the partition with LUKS -- I basically followed the docs on the Arch Wiki. I will share that I forgot to mount my home directory before moving on and had to go back after I finished most of the installation process to figure out what I did wrong. I also still don't fully understand how mounting block devices works under the hood. But after this install, I definitely know how to use `lsblk` and other utilities way better.

After I generated an `fstab` file with `genfstab -U /mnt >> /mnt/etc/fstab`, I ran `arch-chroot /mnt` to change the root of my session to the filesystem at `/mnt` and continued with the installation.

## Networking, initramfs, boot loader
---
I went with [systemd-networkd](https://wiki.archlinux.org/title/Systemd-networkd) as my [network manager](https://wiki.archlinux.org/title/Network_configuration#Network_managers). It's a little more work than something like [NetworkManager](https://wiki.archlinux.org/title/NetworkManager) but you get to learn more about the internals. I installed `resolved` which is important for DNS resolution. I also installed `iwd` and enabled it. I made sure to enable all of these services (networkd, resolved, and iwd) so that when I went to reboot the machine, I would have the tools I needed to connect to the internet.

Because I encrypted my drive, I needed to modify the `mkinitcpio.conf` file so that my initramfs had all the things needed to decrypt my volume at boot. Basically, initramfs is a very small, temporary user space that is loaded into ram before `systemd` starts. I needed the following hooks in `/etc/mkinitcpio.conf`:

```
HOOKS=(base systemd autodetect microcode modconf kms keyboard sd-vconsole block sd-encrypt lvm2 filesystems fsck)
```


I used `systemd-boot` which is only available for UEFI partitions, not for BIOS partitions. I needed to install it by running `bootctl install`. I had some issues because I hadn't properly mounted my /boot partition. Then, I configured my boot loader by creating an entry at `/boot/loader/entries/arch.conf`. One fun thing I learned about during this part of the process is the boot order on modern systems:

1. POST (power on self-test) — searches for a BIOS installed on your motherboard
2. BIOS (Basic I/O system) — searches for a boot loader on your disk
3. Boot loader — boots an OS
4. OS — starts with the init process
5. Init process (usually `systemd` which replaced `SysV`)

The last thing I did before exiting `chroot` and booting was create my user and password and adding myself to the wheel group. After booting into the system, I installed [Hyprland](https://hyprland.org/) as my desktop environment, Firefox for web browsing, Obsidian for notes, and Alacritty for my terminal.

## Key lessons learned
---
 I'm happy to report that I'm still using the machine and frankly, I'm loving it. One huge takeaway is that I now default to using `man` pages whenever I need to fix something. Google and ChatGPT are great but searching a man page for a keyword is so fast. It's also just so cool to have all the information you need on your system, with or without an internet connection.

 I have frankly been surprised by how much work I can get done on this machine. However, it's not a replacement for my Mac. For example, I recently I had to install some terrible application in order to take a test for an AWS cert and I literally wouldn't have been able to do it in the time I had without my Mac. As much as I love Arch, there are just too many things that require hours upon hours of debugging and configuring. For the basics, it's great. But much like Neovim, it can be a real hassle to use once you start trying to do complicated things. Still, it's nice to know that if Apple ever forced my hand, I could use Linux as a daily driver.
