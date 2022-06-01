# General Security

For most security issues you can simply follow some general security measures to investigate the issue and secure it.

## Internal Security

Internally there's both some setup security and attack protocols to assure that the server is not vulnerable to attacks.

### Setup Security

Initially you'll have to manually secure some parts to assure the security of the application. To do this first run `sudo chmod 755 secure.sh` in the root directory of the project to make the script executable. After that make sure to at least run the application once using the instructions in the [README](../README.md) to assure that all files are present. Then run `sudo ./secure.sh`. This will automatically adjust the directory permissions to limit the access of the resources to root users and the application. Then close off the shell file using `sudo chmod 000 secure.sh` to prevent adjustments later on. Besides that it's highly recommended that you adjust the [settings](../settings.json) to make sure that the database is hosted is on an external server.

### Internal Attack Protocol

If it seems like someone managed to get access the internal server, make sure that you change the permission of the directory as soon as possible and validate the integrity of components like the log files.

On linux systems you can use `sudo chmod -R 000 /path/to/directory` to block access from any non root users. After you blocked access, attempt to find out which user was hacked using `sudo tail -f /var/log/syslog`. If the user however has managed to get access to a root user, change the root password immediately using `sudo passwd root`.

### Overlooked Internal Security

Sadly due to the nature of how the user interactions work, personal information like emails, phone numbers and address information cannot be secured. Instead it's highly recommended that the SQL is free of any injection holes by never inserting variable directly into the query and hosting the database externally to avoid having all the data leaked if the servers get attacked internally.

The server is vulnerable to attacks which take over the user which hosts the source codes due to the nature of how the auto security shell script works. For this reason it's recommended to host it on the root of the server.

## Site Attack Protocol

Sometimes attacks might come through the application itself, in this case you should attempt to resolve the issue without resorting to shutting down the application for long periods of time.

Incase of a DDOS attack, use the protocol specified in the dedicated [DDOS document](DDOS.md), otherwise if the security issue is through a flaw in the application, attempt to resolve the issue by using the already available data, the logs files will provide every output given by the application, attempt to get the info you need by using these logs. Once the issue has been located, attempt to patch it, if required, [blacklist](../blacklist.json) the IP of the attacker, run `npm run prepare` and after that restart the process.
