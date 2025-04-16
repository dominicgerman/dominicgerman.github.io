# homelab-wiki

You can find the full site at [docs.dominicgerman.com](https://docs.dominicgerman.com).

## Abstract

A wiki format information repository detailing my homelab setup. It is meant to be a resource that anyone can use to create something similar. This site is inspired by [ironicbadger's pms wiki](https://github.com/ironicbadger/pms-wiki).

The primary technologies I use are [Linux](https://www.linux.org/), Containers (via [docker](https://www.docker.com/) and managed using [docker-compose](https://docs.docker.com/compose/)), [Proxmox](https://www.proxmox.com/en/), [mergerfs](https://github.com/trapexit/mergerfs/), [SnapRAID](http://www.snapraid.it/) and [ZFS](https://zfsonlinux.org/). I use mostly use Ubiquiti's [Unifi](https://ui.com/) products for networking.

## Usage

If writing and wanting to run a local copy of the wiki, run:

```bash
docker-compose up --build
```

or

```bash
pip3 install -U -r requirements.txt

mkdocs serve
```

In both cases the site will be available at `localhost:8000`. In the docker version though some niceities like auto refresh on save go away.

## Deployment

To deploy the site, push to `main`, and a GitHub action will do the rest.

## Contributing

To contribute, open a PR, and I will review it. Gratefully received!
