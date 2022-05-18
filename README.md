# Rent-A-Car

A restful API and PostgreSQL based website which allows you to easily rent cars while user friendly for employees.

## Settings

The settings are expected to be specified in the `settings.json` file on the project root.

| Variable                         | Type        | Parent     | Usage                                                                          |
|----------------------------------|-------------|------------|--------------------------------------------------------------------------------|
| web                              | `object`    | N.A.       | The object which holds all web settings                                        |
| host                             | `string`    | `web`      | The address which should be targeted by the API                                |
| port                             | `number`    | `web`      | The port which should be targeted by the API                                   |
| max_packet_size                  | `number`    | `web`      | The max size of a request which will be handled in MBs                         |
| data                             | `object`    | N.A.       | The object which holds all the database settings                               |
| host                             | `string`    | `data`     | The address of the postgres instance                                           |
| port                             | `number`    | `data`     | The port of the postgres instance                                              |
| database                         | `string`    | `data`     | The database name which holds all the tables                                   |
| api                              | `object`    | N.A.       | The object which holds all the API settings                                    |
| version                          | `number`    | `api`      | The version of the current API. This will be used in the URL                   |
| token_days_valid                 | `number`    | `api`      | The number of days that a token should be considered valid                     |
| token_refresh_margin             | `number`    | `api`      | Adds margin to auto-refresh the token before its expiration upon activity      |
| max_pending                      | `number`    | `api`      | The number of days before a pending rent entry is considered invalid           |
| change_perm_level_permission     | `PermLevel` | `api`      | The permission level required to edit the permission level of a user entry     |
| user_view_permission             | `PermLevel` | `api`      | The permission level required to view all users                                |
| car_creation_permission          | `PermLevel` | `api`      | The permission level required to create car entries                            |
| car_edit_permission              | `PermLevel` | `api`      | The permission level required to edit car entries                              |
| setup_status_toggle_permission   | `PermLevel` | `api`      | The permission level required to toggle the car setup status                   |
| rent_status_toggle_permission    | `PermLevel` | `api`      | The permission level required to overwrite toggle the rent pending status      |
| rent_history_permission          | `PermLevel` | `api`      | The permission level required to see the rent objects of a car or user         |
| rent_administration_permission   | `PermLevel` | `api`      | The permission level required to see the administration details of a rent item |
| security                         | `object`    | N.A.       | The object which holds all the security related settings                       |
| warning_sample_length            | `number`    | `security` | The amount of seconds a DDOS sample should be taken at a time                  |
| requests_before_warning          | `number`    | `security` | The amount of total requests before a sample should be considered a DDOS       |
| ip_requests_before_warning       | `number`    | `security` | The amount of requests from an IP before a sample should be considered a DDOS  |
| endpoint_requests_before_warning | `number`    | `security` | The amount of requests on an url before a sample should be considered a DDOS   |

## Permission Levels

Some settings require a type called `PermLevel`. This is based on the enumeration below. Any levels above the provided level will also be seen as valid.

| Type     | Value |
|----------|-------|
| Disabled | `-1`  |
| User     | `0`   |
| Employee | `1`   |
| Manager  | `2`   |

## Environment Variables

The environment variables are expected to be specified in the `.env` file on the project root.

| Variable    | Type     | Usage                 |
|-------------|----------|-----------------------|
| DB_USER     | `string` | The database user     |
| DB_PASSWORD | `string` | The database password |
