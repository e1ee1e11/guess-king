REPO ?= e1ee1e11
TAG ?= latest

.PHONY: venv
venv:
	source ./venv/bin/activate

.PHONY: docker-build
docker-build:
	docker build -t ${REPO}/guess-king:${TAG} .

.PHONY: docker-run
docker-run:
	docker run --rm --name guess-king -d -p 5000:5000 e1ee1e11/guess-king:${TAG}
