from data_importer.config import settings
from data_importer.loaders.base_loader import BaseDataLoader
from data_importer.schemas import Indicators
from data_importer.schemas import Materials


def pipeline():
    materials_loader = BaseDataLoader(Materials, str(settings.materials_json))
    materials_loader.write_to_db("material")
    indicators_loader = BaseDataLoader(Indicators, str(settings.indicators_json))
    indicators_loader.write_to_db("indicator")
