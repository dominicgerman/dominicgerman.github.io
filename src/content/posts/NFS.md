---
title: NFS shares
pubDate: 2026-01-15
tags:
  - homelab
draft: false
---
# NFS

On `nas`:
```sh
apt update
apt install nfs-kernel-server
```

```sh
systemctl enable nfs-server
systemctl start nfs-server
```

Export datasets via nfs in `/etc/exports`:
```txt
/dpool/media    192.168.1.0/24(rw,async,no_subtree_check,no_root_squash)

# The config on lab needed an FSID
/mnt/storage        192.168.1.0/24(rw,sync,crossmnt,fsid=0)
```

Apply config:
```sh
exportfs -ra
systemctl reload nfs-server
```

Verify shares:
```sh
exportfs -v
showmount -e localhost
```

On client node:
```sh
apt install nfs-common
mkdir -p /mnt/nas/media
mount -t nfs <NAS_IP>:/dpool/media  /mnt/nas/media
```

Mounting manually worked fine for me but when I tried mounting from `etc/fstab`, I was getting mount errors saying the folder/file didn't exist. I'll sort out the errors later.
```txt
<NAS_IP>:/dpool/media /mnt/nas/media nfs4 rw,_netdev,noatime,hard,intr 0 0
```