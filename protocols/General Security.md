# General Security

For most security issues you can simply follow some general protocols to investigate the issue and secure it.

## Internal Security

If it seems like someone managed to get access the internal server, make sure that you change the permission of the directory as soon as possible and validate the integrity of components like the log files.

On linux systems you can use `sudo chmod -R 000 /path/to/directory` to block access from any non root users. After you blocked access, attempt to find out which user was hacked using `sudo tail -f /var/log/syslog`. If the user however has managed to get access to a root user, change the root password immediately using `sudo passwd root`.

## Site security

Sometimes attacks might come through the application itself, in this case you should attempt to resolve the issue without resorting to shutting down the application for long periods of time.

Incase of a DDOS attack, use the protocol specified in the dedicated [DDOS document](DDOS.md), otherwise if the security issue is through a flaw in the application, attempt to resolve the issue by using the already available data, the logs files will provide every output given by the application, attempt to get the info you need by using these logs. Once the issue has been located, attempt to patch it, if required, [blacklist](../blacklist.json) the IP of the attacker, run `npm run prepare` and after that restart the process.
