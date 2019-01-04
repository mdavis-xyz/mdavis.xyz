echo "updating git"
cd git/abbottList
pwd
git commit -a -m 'shell script update'
git push origin master < ../../gitInput.mld
