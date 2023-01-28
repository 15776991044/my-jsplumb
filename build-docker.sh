name=`pwd | sed -r 's/^.+\///'`

docker build -f docker/Dockerfile -t hub.dev.laningtech.net/apps/${name} .
