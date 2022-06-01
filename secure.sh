#!/bin/sh

# Securing all the import directories
echo "Securing the logs directory";
sudo chmod -R 600 ./logs;
echo "Securing the src directory";
sudo chmod -R 655 ./src;
echo "Securing the dist directory";
sudo chmod -R 755 ./dist;
echo "Securing the node_modules directory";
sudo chmod -R 755 ./node_modules;

# Securing the general private data files
echo "Securing the .env file";
sudo chmod 700 ./.env;
echo "Securing the blacklist file";
sudo chmod 700 ./blacklist.json;

# The following files could be adjusted to compile the code in an alternative method, thus they need to be locked
echo "Securing the tsconfig file";
sudo chmod 755 ./tsconfig.json;
echo "Securing the package files";
sudo chmod 755 ./package.json;
sudo chmod 755 ./package-lock.json;