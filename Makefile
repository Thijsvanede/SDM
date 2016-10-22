all: start

start:
	./bash_scripts/start.sh

test:
	./bash_scripts/test.sh
	
stop:
	./bash_scripts/stop.sh
	
git:
	./bash_scripts/git.sh