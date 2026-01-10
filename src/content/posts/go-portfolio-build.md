---
title: Building a Blog with Go
# description: Gophers unite!
pubDate: 2024-09-17
tags:
  - programming
  - golang
  - backend
  - go
draft: false
---

Here's the [Github repo](https://github.com/dominicgerman/dominicgerman.com) for reference.

## Background

---
I've been using [Obsidian](https://obsidian.md/) to keep track of all my notes and tasks since 2023. In Obsidian, everything is just markdown files under the hood which makes it trivially easy to generate wikis, blogs, and more from your Obsidian vault.

I wanted to set up a blog and check out Deno and lucky for me, Deno had a [blog module](https://deno.land/x/blog@0.7.0). It was essentially one config file, had a nice enough looking UI out of the box and it was possible to self-host. After setting it up, I wrote a little deployment pipeline such that I could run one command to build and deploy up-to-date markdown files on my local machine to my VPS via a webhook.

Unfortunately, my blog stopped building after the release of `Deno 1.44.3`. After a few hours of debugging, I gave up and decided to rewrite it in Go. Since I've mostly written JS and Python, I relied heavily on Alex Edwards' fantastic book, [Let's Go](https://lets-go.alexedwards.net/).


## Project structure and configuration
---
In a nutshell, the application is a web server that serves dynamic html based on data from a SQLite database. The database contains each blog post's content and metadata as well as user and session data. Posts are created and updated via forms in the UI that are accessible to authenticated users. The UI uses Go’s `html/template` package and all of the CSS was handwritten by yours truly.

```
├── cmd
	└── web
		├── handlers.go
		├── helpers.go
		├── main.go
		└── routes.go
├── internal
	├── models
	└── validator
├── sql
	└── schema
└── ui
	├── html
	├── static
	└── efs.go
├── devblog.db
├── go.mod
└── go.sum
```

The `cmd` directory contains logic specific to the `web` application. The `internal` directory holds all the non-application specific logic like interacting with the database and helper functions for HTML form validation. Schema files are in the `sql` directory and `ui` contains both HTML templates and other static assets like CSS and images. 


## Database
---
I chose SQLite for this project because I wanted to embed the database in the compiled Go binary which is the coolest thing ever as far as I'm concerned. However, there were some gotchas on that front -- more on that at the end of this post. I used Go’s `database/sql` package with the `go-sqlite3` driver which allows the application and db to communicate and leverages a pool of database connections for efficiency. The database logic is encapsulated in a standalone `models` package (internal to the project) which ensures modularity and maintainability. SQL statements are executed with placeholder parameters to prevent SQL injection.

The database schema is defined with files in the `sql/schema` directory. I used the excellent SQL migration tool `goose` to run database migrations and manage schema changes. The versioning system applies migrations in sequential order based on filename via an easy-to-use cli tool.


## Middleware
---
The blog includes user authentication, allowing only registered and logged-in users to create new posts, while anyone can view them. Unsurprisingly, I'm the only registered user. I login at `/user/login`, where credentials are verified against the database, and a session is created with an `authenticatedUserID`. This session is checked on subsequent requests to determine authentication status, expiring when the user logs out. Other security measures include password encryption and protection against CSRF attacks.

I implemented middleware chains to set standard HTTP headers, log incoming requests, and recover from panics gracefully. The middleware follows an idiomatic Go pattern compatible with `net/http` and third-party packages. I structured the middleware into composable chains, making it easy to apply multiple layers of functionality while keeping the code organized and maintainable.


## UI
---
The UI is built entirely using Go’s `html/template` package which allowed me to create reusable layout elements as well as ensure type-safety and provide caching. It's ideal for safely generating web pages as it provides built-in protection against XSS and allows custom functions. It's like a statically-typed, compiled, highly-performant version of PHP where all the features are built into the standard library.

Speaking of compiled, the Go standard library includes an [`embed`](https://pkg.go.dev/embed/) package which allowed me to embed _all the static files_ used by my application into the compiled executable binary. For those keeping score at home, that means the all the CSS files, JavaScript files, image files, the HTML templates _and the entire database_ are compiled into one executable. This essentially means that the entire app can be deployed by copying one file to a server and running that file. So cool.

I used the terrific `yuin/goldmark` package for parsing raw markdown (stored in the db) and rendering it as HTML in the user interface. It's the same package used by [Hugo](https://github.com/gohugoio/hugo), an awesome static site generator written in Go.

The design of the UI is based on Deno's blog module as well as the [Full Stack Open](https://fullstackopen.com/en/) web development course from the University of Helsinki. I'm one of those rare devs who actually loves writing CSS as much as I love backend development -- at least for my own projects. I tend to follow [Heydon Pickering's](https://heydonworks.com/) approach to writing CSS and I frequently consult his book [Every Layout](https://every-layout.dev/). 

One fun thing that I stole from him is a way to manually implement a theme switcher for grayscale-only sites like mine:

```css
@media (prefers-color-scheme: light) {
	:root {
		filter: invert(100%);
	}

	img:not([src*='.svg']),
	video,
	.hero-image {
		filter: invert(100%);
	}
}
```

It literally just inverts all the colors on the page (excluding images) based on the user's system setting for dark/light theme preference. That's dark theme support clocking in at around 200 bytes uncompressed.


## Conclusion
---
To keep this post from getting too long, I'll cover how I deploy the app in a follow-up post. This will include the issues I faced embedding SQLite. I'll also talk about my self-hosted server setup (a Raspberry Pi for now) and other fun details like the deployment script.

Thanks for reading!