.DEFAULT_GOAL := seed-data


seed-data: seed-gadm

seed-gadm:
	@echo "Starting seeding gadm data... "
	@time $(MAKE) -C ./gadm_3.6 import

