data
==============================

repo to save all data related stuff

Project Organization
------------

    ├── LICENSE                 <- The LICENSE using this project.
    ├── README.md               <- The top-level README for developers using this project.
    ├── CHANGELOG.md            <- The top-level CHANGELOG for developers using this project.
    ├── env.default  			<- Environment vars definition
    ├── Makefile           		<- Makefile with commands
    ├──.editorconfig			<- Helps maintain consistent coding styles
    ├──.pre-commit-config		<- Helps setup github basic precommit hooks
    ├── Dockerfile         		<- Docker file definition
    ├── docker-compose.yml  	<- Docker configs environment definition
    ├── .dockerignore  			<- files don't want to copy inside container
    ├── .gitignore  			<- files don't want to copy in githubs
    ├── .github  				<- github configs
    │   └── pull_request_template.md <- github pr template
    ├── requirements.txt       	<- The requirements for development
    ├── setup.cfg   			<- a config file for pytest, flake8 and yapf
    ├── setup.py   				<- config file for pip module
    ├── docs 					<- A default Sphinx project with support for module autodoc and markdown.
    │   └── __init__.py
    ├── test                	<- Test setup folder using pytest, datatest and hypothesis
    │   └── __init__.py
    ├── tox.ini            	    <- tox file with settings for running tox;
    |
    ├── data
    │   ├── processed           <- The final, canonical data sets for modeling.
    │   └── raw                 <- The original, immutable data dump.
    |
    |
    │   ├── notebooks           <- Naming convention is a number (for ordering),
    │   │                       the creator's initials, and a short `-` delimited e.g.
    │   │                       `1.0-jqp-initial-data-exploration`.
    │   │
    │   ├──.env
    │   ├──.dockerignore
    │   ├──requirements.txt           <- Notebooks requirements
    │   ├──Dockerfile                 <- Sets up Jupyter notebooks environment
    │   ├──jupyter_notebook_config.py <- Configure Jupyter notebooks
    │   ├── template_notebooks        <- where the notebooks template will live.
    │   │
    │   ├── Lab                 <- Testing and development
    │   │
    │   └── Final               <- The final cleaned notebooks for reports/ designers /
    |				               developers etc.
    │

--------

## Steps for use:

### Install:
------------
#### First, setup one of your environments

- With [docker]() and [docker-compose]() in your system, you can develop inside containers:
``` bash
make up
```
And if you want to get into the main container:
``` bash
make inside
```
------------
- Install requirements on your machine:
``` bash
make requirements
```
- Set up a new environment in your machine
``` bash
make create_environment && make requirements
```
------------
#### Second, Init git and initialize the github pre-hooks
``` bash
make init-prehooks
```
By default this will treat your project remote branch as `git@github.com:Vizzuality/data` if you need to change it don't forget to modify the `Makefile` before running this command. Take into account that this will create a new repository under the vizzuality organization once you `git push -u origin master`

#### Happy coding and science!

You can run your tests:
``` bash
make test
```

You can lint and reformat your code:
``` bash
make lint
```
or up and serve the documentation:
``` bash
make serve-doc
```

--------
<p><small>Project based on the <a target="_blank" href="https://drivendata.github.io/cookiecutter-data-science/">cookiecutter data science project template</a>. #cookiecutterdatascience</small></p>
