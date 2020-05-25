const Docker = require("dockerode");
const docker = new Docker();

const fs = require("fs");
const fetch = require("node-fetch");

const stripAnsi = require("strip-ansi");
const associations = require("./associations");

const embed = (name, content) => {
  return {
    embed: {
      color: 0x36393f,
      author: {
        name: name
      },
      description: content
    }
  };
};

const displayError = (content) => {
  return embed("Error", content.message);
};

module.exports.create = async (channel, db, associationKey) => {
  if (db.get("containers").find({ channel: channel.id }).value()) {
    channel.send(
      embed(
        "Already Exists",
        "A container already exists for this channel. You can run commands in it with `$ <command>`, or remove it with `$ remove`."
      )
    );
    return;
  }

  let image = associations['linux'];
  if (associationKey && associations[associationKey]) {
    image = associations[associationKey];
  }

  const progress = await channel.send(embed("Creating...", "A container for this channel is being created with image `" + image + "`."));
  docker.createContainer(
    {
      Image: image,
      Tty: true,
      Cmd: [ "/bin/sh" ]
    },
    async (error, container) => {
      if (error) {
        await progress.edit(displayError(error));
        return;
      }
      container.start(async (error) => {
        if (error) {
          await progress.edit(displayError(error));
          return;
        }
        db
          .get("containers")
          .push({
            channel: channel.id,
            id: container.id
          })
          .write();
        await progress.edit(
          embed(
            "Done",
            [
              "Successfully created a container for this channel with image `" + image + "`.",
              "You can run commands in it with `$ <command>`, or remove it with `$ remove`."
            ].join(' ')
          )
        );
      });
    }
  );
};

module.exports.remove = async (channel, db) => {
  const containerInDb = db.get("containers").find({ channel: channel.id }).value();
  if (!containerInDb) {
    await channel.send(embed("Not Found", "There isn't a container for this channel. You can create one with `$ create`."));
    return;
  }
  const container = docker.getContainer(containerInDb.id);

  let progress = await channel.send(embed("Stopping...", "This channel's container is being stopped."));
  container.stop(async (error) => {
    let knownAsDeleted = false;
    if (error && error.statusCode !== 304) {
      await progress.edit(displayError(error));
      return;
    } else {
      knownAsDeleted = true;
      progress = await progress.edit(
        embed(
          "Error",
          "It looks like there used to be a container for this channel but it was deleted. You can create another one with `$ create`."
        )
      );
    }
    progress = await progress.edit(embed("Removing...", "This channel's container is being removed."));
    container.remove(async (error) => {
      if (error && error.statusCode !== 404) {
        await progress.edit(displayError(error));
        return;
      } else if (!knownAsDeleted) {
        progress = await progress.edit(
          embed(
            "Error",
            "It looks like there used to be a container for this channel but it was deleted. You can create another one with `$ create`."
          )
        );
      }
      db.get("containers").remove({ channel: channel.id }).write();
      await progress.edit(
        embed("Done", "Successfully removed this channel's container. You can create another one with `$ create`.")
      );
    });
  });
};

module.exports.run = async (channel, command, db) => {
  const containerInDb = db.get("containers").find({ channel: channel.id }).value();
  if (!containerInDb) {
    await channel.send(embed("Not Found", "There isn't a container for this channel. You can create one with `$ create`."));
    return;
  }

  const container = docker.getContainer(containerInDb.id);
  if (!container) {
    await channel.send(
      embed(
        "Error",
        "It looks like there used to be a container for this channel but it was deleted. You can create another one with `$ create`."
      )
    );
    return;
  }

  let progress = await channel.send(embed("Running...", "Your command is being run in this channel's container."));
  let output = "";

  const options = {
    Cmd: [ "sh", "-c", command ],
    AttachStdout: true,
    AttachStderr: true
  };

  container.exec(options, async (error, exec) => {
    if (error) {
      await progress.edit(displayError(error));
      return;
    }
    exec.start(async (error, stream) => {
      if (error) {
        await progress.edit(displayError(error));
        return;
      }
      stream.on("data", (chunk) => {
        output += stripAnsi(chunk.toString()).replace(/[\u0000-\u0008,\u000E-\u001F,\u0082-\u008D,\u0090-\u009F,\u05F5-\u05FF,\u0800-\u08FF,\u0EE4-\u0EFF,\uFFF0-\uFFFF]/gu, "");
      });
      stream.on("end", async () => {
        if (output.length > 2000) {
          progress = await progress.edit(embed("Uploading...", "The output of your command is being uploaded."));

          const res = await fetch("https://txt.pwnsquad.net/", {
            headers: {
              "Content-Type": "text/plain",
              "Authorization": process.env.TXT_TOKEN
            },
            body: output
          });
          const path = await res.text();
          const url = `https://txt.pwnsquad.net/${encodeURIComponent(path)}`

          await progress.edit(
            embed(
              "Done",
              "The output of your command was greater than 2000 characters, so it was uploaded.\n" + url
            )
          );
        } else {
          await progress.edit(embed("Done", "```\n" + output + "\n```"));
        }
      });
    });
  });
};

module.exports.info = async (channel, guildCount, containerCount) => {
  await channel.send(
    embed(
      "Info",
      [
        "I can create containers for you to run commands in.",
        "There are also containers with preinstalled tools, see the associations link at the bottom.",
        `I currently have ${containerCount} container${containerCount != 1
          ? "s"
          : ""} running, and I'm on ${guildCount} server${guildCount != 1 ? "s" : ""}.`,
        "",
        "Commands:",
        "- `$ info`",
        "- `$ create`",
        "- `$ remove`",
        "- `$ <command>` or `$ run <command>`",
        "",
        "Invite me:",
        "https://bit.ly/termbot",
        "",
        "Support server: https://discord.gg/9PmwWrA",
        "Associations: https://gitlab.com/pwnsquad/term#associations",
        "Source code: https://gitlab.com/pwnsquad/term",
        "Status: https://status.pwnsquad.net/"
      ].join("\n")
    )
  );
};

module.exports.hello = async (channel) => {
  await channel.send(
    embed("Hello", "Thanks for inviting me to your server! You can learn more about how to use me with `$ info`.")
  );
};
