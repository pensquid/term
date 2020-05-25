# Term

A Discord bot that will let you run commands in Docker containers. In other words, you can create a totally isolated computer, optionally with preinstalled programs, per channel.

[Bot status](https://status.pwnsquad.net/)

[![Term on Discord Bot List](https://discordbotlist.com/bots/520710130598150144/widget)](https://discordbotlist.com/bots/520710130598150144)

## Usage

Here are some of the commands you can use, and what they do:

- `$ info` will show some info about Term, and also list the commands
- `$ create` will create a container for the current channel if one doesn't exist
- `$ remove` will remove the current channel's container if it exists
- `$ <command>` or `$ run <command>` will run bash commands in the current channel's container

## Associations

Term supports creating containers with preinstalled commands. We call the collections of tools associations.

Below are our current associations. Feel free to open an issue or merge request if you'd like more.

 - `python`, `python3`: Python version 3 with `pip`
 - `python2`: Python version 2 with `pip`
 - `node`: A NodeJS environment with `npm`, `node`, and `yarn`
 - `docker`: Docker within Docker, for Dockerception
 - `perl`: Just a perl environment
 - `ruby`: A Ruby environment with `gem` and `ruby` installed
 - `alpine`: Alpine Linux, with updated package lists
 - `linux`, `ubuntu`, `ubuntu1804`: Ubuntu 18.04; make sure to run `apt-get update`
 - `ubuntu1810`: Ubuntu 18.10; also make sure to run `apt-get update`
 - `arch`, `archlinux`: A basic Arch Linux installation
 - `go`, `golang`: a fully working Go setup

To use an association, for example `python`, use `$ create python`.

## Running

Since Term is open-source you might want to run it yourself, for whatever reason. Here's how.

### Installation

You'll need to [install Docker](https://docs.docker.com/install/) first.

```
$ git clone https://gitlab.com/pwnsquad/term.git
$ yarn install
```

For each of the images (see [the images](https://gitlab.com/pwnsquad/term/blob/master/associations.js)) that you want to use you'll have to run the following:

```
$ docker pull <IMAGE>
```

### Running

Term uses the environment variable `BOT_TOKEN` for your bot token. Make sure to create a bot on Discord's developer dashboard.

Here's how to run it:

```
$ BOT_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxx" yarn start
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Development

While working on Term's code you might want the bot to automatically restart when you make changes. Here's how:

```
$ BOT_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxx" yarn dev
```