# Rent-A-Car

A restful API and PostgreSQL based website which allows you to easily rent cars while user friendly for employees.

## Settings

The settings are expected to be specified in the `settings.json` file on the project root.

| Variable               | Type     | Parent | Usage                                                                     |
|------------------------|----------|--------|---------------------------------------------------------------------------|
| `web`                  | `object` | N.A.   | The object which holds all web settings                                   |
| `host`                 | `string` | `web`  | The address which should be targeted by the API                           |
| `port`                 | `number` | `web`  | The port which should be targeted by the API                              |
| `max_packet_size`      | `number` | `web`  | The max size of a request which will be handled in MBs                    |
| `data`                 | `object` | N.A.   | The object which holds all the database settings                          |
| `host`                 | `string` | `data` | The address of the postgres instance                                      |
| `port`                 | `number` | `data` | The port of the postgres instance                                         |
| `database`             | `string` | `data` | The database name which holds all the tables                              |
| `api`                  | `object` | N.A.   | The object which holds all the API settings                               |
| `version`              | `number` | `api`  | The version of the current API. This will be used in the URL              |
| `token_days_valid`     | `number` | `api`  | The number of days that a token should be considered valid                |
| `token_refresh_margin` | `number` | `api`  | Adds margin to auto-refresh the token before its expiration upon activity |

## Environment Variables

The environment variables are expected to be specified in the `.env` file on the project root.

| Variable      | Type     | Usage                 |
|---------------|----------|-----------------------|
| `DB_USER`     | `string` | The database user     |
| `DB_PASSWORD` | `string` | The database password |
