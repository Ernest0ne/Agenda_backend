
echo "                :======*+-                                                                                                                                     "
echo "              :=============+-                                                                                                                                 "
echo "           :======+-        -++                                                                                                                                "
echo "         :=====*-        :@WWWWWD@=:                                                                                                                           "
echo "      :=====-              -WWWWWWL+   .______     ______    __           ___      .______       __       _______.     ______   ______   .______       _______ "
echo "    :=====*                  @WWWWWW@  |   _  \   /  __  \  |  |         /   \     |   _  \     |  |     /       |    /      | /  __  \  |   _  \     |   ____|"
echo "  :=======                   -WWWWWWW@ |  |_)  | |  |  |  | |  |        /  ^  \    |  |_)  |    |  |    |   (----|   |  ,----'|  |  |  | |  |_)  |    |  |__   "
echo " ========-                    -WWWWWWW |   ___/  |  |  |  | |  |       /  /_\  \   |      /     |  |     \   \       |  |     |  |  |  | |      /     |   __|  "
echo " ========                     -WWWWWWW |  |      |  |__|  | |  |----. /  _____  \  |  |\  \----.|  | .----)   |      |   ----.|  |__|  | |  |\  \----.|  |____ "
echo " *=======-                    +WWWWWWW | _|       \______/  |_______|/__/     \__\ | _| \ _____||__| |_______/        \______| \______/  | _| \ _____||_______|"
echo " :=======*                    #WWWWWW:                                                  __        ___                                                          "
echo "  :=======:                  *WWWWW:                                                   /_ |      / _ \                                                         "
echo "    :=======*             -@WWWW:                                                       | |     | | | |                                                        "
echo "     +=======*-        -@WWWWJ:                                                         | |  __ | |_| |                                                        "
echo "      :-    -:::-    :#WWWWM:                                                           |_| (__) \___/                                                         "
echo "        +@W#==*=#@WWWWWWWA:                                                                                                                                    "
echo "           -*@WWWWWWWWWW:                                                                                                                                      "
######################################################################################################################################################################
#Removemos paquetes de linux
sudo yum clean all
sudo yum -y remove nano
sudo yum -y remove wget
sudo yum -y remove unzip
sudo yum -y remove httpd
sudo yum -y remove nodejs 
sudo yum -y install bzip2
sudo yum -y remove  gcc-c++
######################################################################################################################################################################
# Instalamos los paquetes de linux
sudo sudo yum -y install nano 
sudo sudo yum -y install wget 
sudo sudo yum -y install unzip 
sudo yum -y install httpd 

sudo systemctl enable httpd 
sudo systemctl start httpd.service 
##################################### CASSANDRA INSTALL ##############################################################################################################
#Instalacion de cassandra
cd /home/ec2-user
sudo > cassandra.repo

sudo echo "[cassandra]" >> cassandra.repo
sudo echo "name=Apache Cassandra" >> cassandra.repo
sudo echo "baseurl=https://www.apache.org/dist/cassandra/redhat/311x/" >> cassandra.repo
sudo echo "gpgcheck=1" >> cassandra.repo
sudo echo "repo_gpgcheck=1" >> cassandra.repo
sudo echo "gpgkey=https://www.apache.org/dist/cassandra/KEYS" >> cassandra.repo

sudo mv cassandra.repo /etc/yum.repos.d/
sudo yum -y install cassandra

sudo curl http://54.221.159.241:3000/downloads/cassandra.yaml > /home/ec2-user/cassandra.yaml 
sudo rm -f /etc/cassandra/conf/cassandra.yaml
sudo mv /home/ec2-user/cassandra.yaml /etc/cassandra/conf/

sudo systemctl daemon-reload
sudo systemctl start cassandra
sudo systemctl enable cassandra
sudo nodetool status

sudo curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash - 
sudo yum -y install nodejs 
sudo yum -y install gcc-c++ make 
######################################################################################################################################################################
# Abrimos puertos del servidor 
# sudo firewall-cmd --zone=public --add-port=3000/tcp --permanent 
# sudo firewall-cmd --reload 
# sudo firewall-cmd --zone=public --add-port=80/tcp --permanent 
# sudo firewall-cmd --reload 
######################################################################################################################################################################
#descarfamos el frontend

sudo curl http://54.221.159.241:3000/downloads/babylon.zip > /home/ec2-user/babylon.zip
sudo mv babylon.zip /var/www/html/

sudo unzip /var/www/html/babylon.zip -d /var/www/html/
######################################################################################################################################################################
#descargamos el backend

sudo curl http://54.221.159.241:3000/downloads/backend.zip > /home/ec2-user/backend.zip 
sudo mv backend.zip /var/www/html/

sudo unzip /home/ec2-user/backend.zip -d /opt/
######################################################################################################################################################################
#Descargamos carpeta de imagenes

sudo curl http://54.221.159.241:3000/downloads/polaris.zip > /home/ec2-user/polaris.zip
sudo mv polaris.zip /opt/

sudo unzip /opt/polaris.zip -d /opt/

sudo chmod 777 -R /opt/polaris
######################################################################################################################################################################
cd /opt/polaris-core-project-backend/backend
sudo npm install -g pm2
sudo npm run init 
sudo pm2 start ecosystem.config.js 
######################################################################################################################################################################
# sudo curl http://100.25.214.91:3000/downloads/polaris-backend.service > /home/ec2-user/polaris-backend.service
# sudo mv polaris-backend.service /lib/systemd/system/polaris-backend.service
# sudo systemctl daemon-reload
# sudo systemctl enable polaris-backend
# sudo systemctl start polaris-backend
# sudo systemctl status polaris-backend 
##################################### CASSANDRA INSTALL ##############################################################################################################
# sudo yum remove -y cassandra

######################################################################################################################################################################
echo "                                          ______   _           _         _                                             "
echo "                                         |  ____| (_)         (_)       | |                                            "
echo "  ______   ______     ______   ______    | |__     _   _ __    _   ___  | |__      ______   ______     ______   ______ "
echo " |______| |______|   |______| |______|   |  __|   | | | '_ \  | | / __| | '_ \    |______| |______|   |______| |______|"
echo "                                         | |      | | | | | | | | \__ \ | | | |                                        "
echo "                                         |_|      |_| |_| |_| |_| |___/ |_| |_|                                        "