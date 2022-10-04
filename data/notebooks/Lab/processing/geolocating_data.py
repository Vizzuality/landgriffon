
from .utils import geocode, _osm_polygon_request


class GeolocateAddress:
    """
    Geocode a query string to (lat, lng) with the Nominatim geocoder
    Parameters
    -----------
    query: string
        the query string to geocode    
    Return
    -----------
    point: tuple
        the (lat, lng) coordinates returned by the geocoder
    """

    def __init__(self, query=''):
        self.geojson = None
        self.query = query
        self.point = self.get_point()
        self.polygon_json = self.get_feature_json()

    def get_point(self):
        """
        Geocode a query string to (lat, lng) with the Nominatim geocoder
        Parameters
        -----------
        query: string
            the query string to geocode    
        Return
        -----------
        point: tuple
            the (lat, lng) coordinates returned by the geocoder
        """
        point = geocode(query=self.query)
        self.geojson = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                    "type": "Point",
                    "coordinates": list(point)
            }
        }
        return point

    def get_feature_json(self):
        """
        Retrieves feature in geojson format
        Parameters
        -----------
        Returns
        -----------

        """
        feature = _osm_polygon_request(
            query=self.query, limit=1, polygon_geojson=1)
        return feature
