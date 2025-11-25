The lagacy Drupal 5 site is currently served via Docker.

Server IP: 192.168.8.103 (on my local network)
Local domain: https://heaven.regen

regen@regenbot:~$ docker ps
CONTAINER ID   IMAGE                                      COMMAND                  CREATED         STATUS          PORTS                                                                          NAMES
d3c76d448dac   nginx:alpine                               "/docker-entrypoint.…"   9 minutes ago   Up 9 minutes    0.0.0.0:80->80/tcp, [::]:80->80/tcp, 0.0.0.0:443->443/tcp, [::]:443->443/tcp   web
ab1b15764cb9   satyadeep/php-53-fpm-alpine-3.4-with-ext   "docker-php-entrypoi…"   9 minutes ago   Up 9 minutes    9000/tcp                                                                       php53
ece90eb2ef1f   yobasystems/alpine-mariadb                 "/scripts/run.sh"        9 minutes ago   Up 9 minutes    0.0.0.0:3306->3306/tcp, [::]:3306->3306/tcp                                    db

Database Info
  user: 'root',
  password: 'mojah42',
  database: 'heaven'