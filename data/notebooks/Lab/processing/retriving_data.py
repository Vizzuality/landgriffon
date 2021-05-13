from .utils import _osm_polygon_request
class RetrieveBoundaries:
    """
    This is a main function for retrieving country boundaries for Nominatim API.
    Parameters
    ----------
    query: str
        query string with the name of the place I want the boundaries from (e.g. 'Manhattan, New York, USA')
    Returns
    ---------
    feature: geojson
        boundaries from the requestes location in geojson format
    """
    def __init__(self, query=''):
        self.query = query

        #request feature
        self.feature_json = self.get_feature_json()
        # self.get_feature_gdf = self.get_feature_gdf()

    def get_feature_json(self):
        """
        Retrieves feature in geojson format
        Parameters
        -----------
        Returns
        -----------

        """
        feature = _osm_polygon_request(query=self.query, limit=1, polygon_geojson=1)
        return feature

    # def get_feature_gdf(self):
    #     polygon, gdf = _osm_polygon_download()
    #     return polygon, gdf

