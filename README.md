# Title
Description

## History
Empty

## Intent
Empty

## Installation
Empty

## Usage
Empty

## Options
Empty

## NGINX
sudo cp ~/mapd.conf $MAPD_STORAGE/mapd.conf
sudo systemctl restart mapd_server
sudo systemctl restart mapd_web_server
 sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt
sudo cp nginx.conf /etc/nginx/nginx.conf 
sudo nginx -t
sudo systemctl restart nginx
sudo cp /etc/ssl/certs/nginx-selfsigned.crt nginx-selfsigned.crt 
sudo cp /etc/ssl/certs/dhparam.pem dhparam.pem 
## Test Cases
Empty

## License
ios-py is an open source python library and licensed under [MIT](../master/LICENSE).