
import requests
import time
# import geopandas as gpd
from collections import OrderedDict

def _osm_polygon_request(query, limit=1, polygon_geojson=1):
    """
    Geocode a place and download its boundary geometry from OSM's Nominatim API.
    Parameters
    ----------
    query : string or dict
        query string or structured query dict to geocode/download
    limit : int
        max number of results to return
    polygon_geojson : int
        request the boundary geometry polygon from the API, 0=no, 1=yes
    Returns
    -------
    response_json : dict
    """
    #define params
    params = OrderedDict()
    params['format'] = 'json'
    params['limit'] = 1
    params['dedupe'] = 0  # prevent OSM from deduping results so we get precisely 'limit' # of results
    params['polygon_geojson'] = 1
    params['q'] = query
    print(f'Params:{params}')
          
    #prepare the nominatim request:
    ## TODO: add default info as setting and import to utils.
    request_type='search'
    #pause_duration=1
    #timeout=30
    #error_pause_duration=180
    nominatim_endpoint = 'https://nominatim.openstreetmap.org/'
    url = nominatim_endpoint.rstrip('/') + '/' + request_type
    prepared_url = requests.Request('GET', url, params=params).prepare().url
    print(f'Preparing url: {prepared_url}')
    
    #make the request:
    req = requests.get(prepared_url)
    #print(reg.response)
    data = req.json()
          
    which_result=1
    if len(data) >= which_result:

        # extract data elements from the JSON response
        result = data[which_result - 1]
        bbox_south, bbox_north, bbox_west, bbox_east = [float(x) for x in result['boundingbox']]
        geometry = result['geojson']
        place = result['display_name']
        features = [{'type': 'Feature',
                     'geometry': geometry,
                     'properties': {'place_name': place,
                                    'bbox_north': bbox_north,
                                    'bbox_south': bbox_south,
                                    'bbox_east': bbox_east,
                                    'bbox_west': bbox_west}}]
          
    if geometry['type'] not in ['Polygon', 'MultiPolygon']:
        print(f'OSM returned a {geometry["type"]} as the geometry')

    return features

# def _osm_polygon_download(features, crs=None):
# """
# Geocode a place and download its boundary geometry from OSM's Nominatim API.
# Parameters
# ----------
# query : features from the Nominatim API

# Returns
# -------
# geometry 
# """
# if crs == None:
#     crs = 'epsg:4326'
# #generates dataframe
# gdf = gpd.GeoDataFrame.from_features(features, crs=crs)

# # extract the geometry from the GeoDataFrame to use in API query
# polygon = gdf['geometry'].unary_union
# print('Constructed place geometry polygon(s) to query API')

# #check that we have a valid geometry
# if not polygon.is_valid:
#     print('Shape does not have a valid geometry')

# return polygon, gdf

def nominatim_request(params, request_type="search", pause=1, error_pause=60):
    """
    Send a HTTP GET request to the Nominatim API and return JSON response.
    Parameters
    ----------
    params : OrderedDict
        key-value pairs of parameters
    request_type : string {"search", "reverse", "lookup"}
        which Nominatim API endpoint to query
    pause : int
        how long to pause before request, in seconds. per the nominatim usage
        policy: "an absolute maximum of 1 request per second" is allowed
    error_pause : int
        how long to pause in seconds before re-trying request if error
    Returns
    -------
    response_json : dict
    """
    if request_type not in {"search", "reverse", "lookup"}:
        print('Nominatim request_type must be "search", "reverse", or "lookup"')
        
    # which API endpoint to use for nominatim queries
    # and your API key, if you are using a commercial endpoint that requires it
    nominatim_endpoint = "https://nominatim.openstreetmap.org/"
    nominatim_key = None
        
    # prepare Nominatim API URL and see if request already exists in cache
    url = nominatim_endpoint.rstrip("/") + "/" + request_type
    prepared_url = requests.Request("GET", url, params=params).prepare().url
    #cached_response_json = _retrieve_from_cache(prepared_url)
    
    if nominatim_key:
        params["key"] = nominatim_key
        
    print(f"Pausing {pause} seconds before making HTTP GET request")
    time.sleep(pause)
    
    # transmit the HTTP GET request
    print(f"Get {prepared_url} with timeout={180}")
    headers = requests.utils.default_headers()
    #headers.update(
    #    {"User-Agent": user_agent, "referer": referer, "Accept-Language": accept_language}
    #)
    response = requests.get(url, params=params, timeout=180, headers=headers)
    sc = response.status_code
    try:
        response_json = response.json()
    except:
        if sc in {429, 504}:
            print(f'response returned {sc} - retry request')
        else:
            print(f' response returned {sc}- ERROR')
    return response_json

def geocode(query):
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
    # define the parameters
    params = OrderedDict()
    params["format"] = "json"
    params["limit"] = 1
    params["dedupe"] = 0  # prevent deduping to get precise number of results
    params["q"] = query
    response_json = nominatim_request(params=params)
    
    # if results were returned, parse lat and lng out of the result
    if response_json and "lat" in response_json[0] and "lon" in response_json[0]:
        lat = float(response_json[0]["lat"])
        lng = float(response_json[0]["lon"])
        #point = (lat, lng)
        point = (lng, lat)
        print(f'Geocoded "{query}" to {point}')
        return point
    else:
        print(f'Nominatim could not geocode query "{query}"')
