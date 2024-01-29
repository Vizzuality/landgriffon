import logging
from enum import Enum
from pathlib import Path
from time import sleep
from typing import Annotated

import numpy as np
import rasterio as rio
import typer

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("aggregate")

GRAS_SILAGE_COMPONENTS = {
    "grassness": 1,
    "legumenes": 1,
    "mixedgrass": 1,
    "ryefor": 1,
    "sorghumfor": 1,
    "swedefor": 1,
    "turnipfor": 1,
    "vegfor": 1,
    "oilseedfor": 1,
    "fornes": 1,
}

# earhstat_25%maizefor_15%soyb_10%oilseedfor_10%citrusnes_10%rapeseed_5%beetfor_5%whea
OTHER_CONCENTRATES_COMPONENTS = {
    "maizefor": 0.25,
    "soyb": 0.15,
    "oilseedfor": 0.1,
    "citrusnes": 0.1,
    "rapeseed": 0.1,
    "beetfor": 0.05,
    "whea": 0.05,
}


class HarvestOrProd(str, Enum):
    harvest = "harvest"
    production = "production"


def crop(filename: str) -> str:
    """Extract crop name from filename like:
    earthstat_global_harvest_oilseedfor_ha.tif -> oilseedfor
    """
    return filename.split("_")[3]


def aggregate(data_dir: Path, proportions: dict[str, float], harvest_or_prod: HarvestOrProd) -> str:
    """Aggregate rasters that in files that are present in proportions map with the corresponding proportion
    into one raster.
    """
    files = list(data_dir.glob("*.tif"))
    components = [(f, proportions[crop(f.stem)]) for f in files if crop(f.stem) in proportions.keys()]
    for i, (file, proportion) in enumerate(components):
        if i == 0:
            with rio.open(file) as ref:
                ref_meta = ref.meta.copy()
                data = ref.read(1, masked=True) * proportion
        else:
            with rio.open(file) as src:
                data += src.read(1, masked=True) * proportion

    unit = "ha" if harvest_or_prod == "harvest" else "t"
    outfile = (
        data_dir
        / f"earthstat_global_{harvest_or_prod.name}_{''.join(f.title() for f in proportions.keys())}_{unit}.tif"
    )

    with rio.open(outfile, "w", **ref_meta) as dest:
        dest.write(np.round(data, 5), 1)

    return outfile.as_posix()


def main(
    data_dir: Annotated[Path, typer.Argument],
    harvest_or_prod: Annotated[HarvestOrProd, typer.Argument(case_sensitive=False)],
) -> None:
    if len(list(data_dir.glob("*.tif"))) == 0:
        raise typer.BadParameter(f"Directory {data_dir} does not contain any tif files.")
    sleep(10)
    gras_silage_filename = aggregate(data_dir, GRAS_SILAGE_COMPONENTS, harvest_or_prod)
    others_filename = aggregate(data_dir, OTHER_CONCENTRATES_COMPONENTS, harvest_or_prod)
    log.info(f"Created {gras_silage_filename}")
    log.info(f"Created {others_filename}")


if __name__ == "__main__":
    typer.run(main)
