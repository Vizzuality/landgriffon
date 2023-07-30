##
# Converting enviormental impact estimates associated with crop and livestock production
# from Halpern et al., 2022, "The environmental footprint of global food production" https://doi.org/10.1038/s41893-022-00965-x
#
#
# Take GHG emissions, excess nutrient production and water use associated with crop groups and livestock, and divide by the production to convert into an emissions intensity
# 
# GHG emissions exclude LUC
# 
# June 2023: Global food system pressure data was downloaded from: https://knb.ecoinformatics.org/view/doi:10.5063/F1V69H1B
# 
# Excess N & P: "Excess N and P nutrients are combined for the assessments in the paper. These mapped data provide excess N and P data separately for all crops (synthetic fertilizers) and reared animals (manure/excretion). Units are tonnes excess N or P (includes, leaching, runoff, volatilization), with coordinate reference system as Gall-Peters equal area with a resolution of 36km2.". Also "tonnes of leached/runoff/volatilized N or P from crops (synthetic fertilizers) and farmed animals (manure/excretion)."
# 
# Crop impacts: "Pressure data for 26 crop categories, excluding the portion estimated to be used as animal feed. Pressures are provided per cell and include disturbance (km2eq); blue freshwater consumption (m3 water); excess nutrients (tonnes NP); and greenhouse gas emissions (tonnes CO2eq)."
# 
# Livestock impacts: "Pressure data for several categories of livestock incurred at the farm site and for crop, fodder, and fish oil/meal feed. Pressures are provided per cell and include disturbance (km2eq); blue freshwater consumption (m3 water); excess nutrients (tonnes NP); and greenhouse gas emissions (tonnes CO2eq)."
# 
# Production data is: "Mapped production data for crops, fisheries, livestock, mariculture. Data are in tonnes with units of production from FAO data. Coordinate reference system is Gall-Peters equal area with a resolution of 36km2."
# 
# 
# Usage rights: Halpern et al. 2022 data is provided with the following usage rights: "This work is dedicated to the public domain under the Creative Commons Universal 1.0 Public Domain Dedication. To view a copy of this dedication, visit https://creativecommons.org/publicdomain/zero/1.0/"
##


wants <- c("terra", "raster")
new.packages <- wants[!(wants %in% installed.packages()[,"Package"])]
if(length(new.packages)) install.packages(new.packages)
lapply(wants, library,character.only = T)

#devtools::install_version("terra","1.7-29")



#Generalise the data path
data.path<-"C:/Users/mikeha/Work/Spatial data/Environmental footprint of global food production/"

setwd(data.path)
crop.impact.path<-('crops_food_raw/')
prodn.path<-('extra_production/')

#impact list
impacts<-c('ghg','nutrient','water')



mapspam.path<-"../MAPSPAM/global 2010/spam2010v2r0_global_prod.geotiff/"

#read the crop categories
crop_tbl <- read.csv('SI_SPAM_crops_tbl.csv')
crop_supers<-unique(crop_tbl$SPAM_super[crop_tbl$inclusion == "included"])
if("fodd" %in% crop_supers)
  crop_supers<-crop_supers[-which(crop_supers == "fodd")] #remove the fodder crop as this is included in the livestock impacts


crop_super_ind_crops<-sapply(crop_supers, function(cs) crop_tbl$SPAM_short_name[crop_tbl$SPAM_super == cs])
crop_super_ind_crops<-crop_super_ind_crops[lapply(crop_super_ind_crops,length) > 1]

names(crop_super_ind_crops)


#Test versions of the impacts and production
b_ghg<-rast(paste0(crop.impact.path,"gall_peter_farm_land_bana_crop_produce_ghg_per_cell.tif"))

b_prod<-rast(paste0(prodn.path,"crop_bana_production.tif"))


#Define equal area projection system and templates for hi_res equal area and WGS84 grids 
gall_peters <- "+proj=cea +lon_0=0 +x_0=0 +y_0=0 +lat_ts=45 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
template_hi_res_gall_peters<-disagg(b_ghg,fact=2)

#raster template 
template_wgs84 <- b_prod
#ext(template_wgs84)
#template_eq_area <- terra::project(x=template_wgs84, y=gall_peters, res=3000) 
template_hi_res_wgs84 <- disagg(template_wgs84,fact = 2)

#Raster pixel areas for the raw wgs84 raster
wgs84_pixel_areas = cellSize(template_wgs84, mask = F, unit = "km")

#### Reversing the transformations made by Halpern et al to convert from wgs84 (mapspam grid) to equal area grid ####

#### Splitting the impacts from crop supers to individual MAPSPAM crops

if(!dir.exists(paths = "crop/ghg_per_t_product_food_wgs84/")) dir.create("crop/ghg_per_t_product_food_wgs84/")
if(!dir.exists(paths = "crop/nutrient_per_t_product_food_wgs84/")) dir.create("crop/nutrient_per_t_product_food_wgs84/")
if(!dir.exists(paths = "crop/water_per_t_product_food_wgs84/")) dir.create("crop/water_per_t_product_food_wgs84/")


#Transform impacts for crops
for(c in crop_supers){
  print(c)
  #Read the production raster
  prodn<-rast(paste0(prodn.path,"crop_",c,"_production.tif")) #metric tonnes
  prodn_gall_peters<-terra::aggregate(
                        project(disagg(prodn/wgs84_pixel_areas, fact = 2, method = 'near'),
                             template_hi_res_gall_peters,method='near'),
                        fact = 2,fun = 'mean')*36
  
  for(impact in impacts){
    print(impact)
    #Read the equal area impact raster
    r_impact<- rast(paste0(crop.impact.path,"gall_peter_farm_land_",c,"_crop_produce_",impact,"_per_cell.tif"))
    
    r_impact_per_t_prodn<-r_impact/prodn_gall_peters
    r_impact_per_t_prodn[is.infinite(r_impact_per_t_prodn)]<-NA
    
    
    # No need to scale by cell size as this is normalised by production already
    # Disaggregate the impact raster to 3km resolution
    # Project this to the hi-res wgs84 grid using nearest neighbour resampling
    # Aggregate the hi-res wgs84 layer up by factor of 2
    # 
    r_impact_per_t_prodn_wgs84<-terra::aggregate(
                                  project(
                                    disagg(r_impact_per_t_prodn, fact = 2, method = 'near'),
                                    template_hi_res_wgs84,method='near'),
                                  fact = 2, fun=mean,na.rm=T)
                                
    
    
    # write to file
    writeRaster(x = r_impact_per_t_prodn_wgs84,
                filename = paste0("crop/",impact,"_per_t_product_food_wgs84/",c,"_per_t_production.tif"), overwrite=TRUE)

  }
  print("-------")
}


#### Splitting the impacts from crop supers to individual MAPSPAM crops

if(!dir.exists(paths = "crop/ghg_per_t_product_food_wgs84_ind_mapspam/")) dir.create("crop/ghg_per_t_product_food_wgs84_ind_mapspam/")
if(!dir.exists(paths = "crop/nutrient_per_t_product_food_wgs84_ind_mapspam/")) dir.create("crop/nutrient_per_t_product_food_wgs84_ind_mapspam/")
if(!dir.exists(paths = "crop/water_per_t_product_food_wgs84_ind_mapspam/")) dir.create("crop/water_per_t_product_food_wgs84_ind_mapspam/")


for(c in crop_supers){
#c = names(crop_super_ind_crops)[1]{
  print(c)
  
  if(c %in% names(crop_super_ind_crops)){
    #Read in production of all individual MAPSPAM crops
    crop_rasters<-sapply(toupper(crop_super_ind_crops[[c]]), function(stc) list.files(path = mapspam.path,pattern = paste0(stc,"_A"),full.names = T))
    
    r_mapspam_prodn<-rast(crop_rasters)
    ext(r_mapspam_prodn)<-c(-180,180,-90,90)
    
    total_prodn<-sum(r_mapspam_prodn)
    proportion_mapspam_prodn<-r_mapspam_prodn/total_prodn
    
    #Read the impact for the super
    for(impact in impacts){
      print(impact)
      
      super_impact<-rast(paste0("crop/",impact,"_per_t_product_food_wgs84/",c,"_per_t_production.tif"))
      
      individual_crop_impact<-super_impact*proportion_mapspam_prodn
      
      #write out the crop maps to file
      for(ic in 1:length(crop_rasters)){
        # write to file
        print(crop_super_ind_crops[[c]][ic])
        writeRaster(x = subset(individual_crop_impact,ic),
                    filename = paste0("crop/",impact,"_per_t_product_food_wgs84_ind_mapspam/",toupper(crop_super_ind_crops[[c]])[ic],"_per_t_production.tif"), overwrite=TRUE)
      }
      
      print("--------")
    }    
  }
  else {
    for(impact in impacts){
      print(impact)
      file.copy(from = paste0("crop/",impact,"_per_t_product_food_wgs84/",c,"_per_t_production.tif"),
                to = paste0("crop/",impact,"_per_t_product_food_wgs84_ind_mapspam/",toupper(c),"_per_t_production.tif"),
                overwrite = T)
      
      print("--------")
    }
  }

  print("--------")
  
}

##### Now for livestock ####

#impact list
impacts<-c('ghg','nutrient','water','disturbance')

livestock.rescaled.impact.path<-('livestock_rescaled/')
livestock.raw.path<-'livestock_raw_unscaled/'
heads.path<-('extra_livestock_counts/')

LG_livestock_groupings = list(
  'bovine_animals' = c('buffaloes','cows'),
  'swine' = 'pigs',
  'sheep_and_goats' = c('sheep','goats'),
  'poultry' = 'chickens'
  )


# First rescale the livestock impacts
# From Halpern
# "Rescaled data are calculated by dividing each pixels pressure value by the total global pressure
# generated by all foods and across all raster cells (raster cell values are multiplied by 1000000 to
# avoid small numbers and rounding errors)"

# read the scaling values
scalars<-read.csv(paste0(livestock.rescaled.impact.path,'rescale_values.csv'))


for(impact in impacts){
  f.rescaled<-list.files(livestock.rescaled.impact.path,pattern = impact)
  print(impact)
  
  impact.scalar = scalars$global_total[scalars$pressure == impact]
  
  for(f in f.rescaled)
  {
    #Read the equal area impact raster
    writeRaster(x = rast(paste0(livestock.rescaled.impact.path,f))*impact.scalar/1000000,
                filename = paste0(livestock.raw.path,f), overwrite=TRUE)
    
  }
}

#Create directories if not already existing
for(impact in impacts){
  if(!dir.exists(paths = paste0("livestock/", impact,"_per_head_wgs84/"))) dir.create(paste0("livestock/", impact,"_per_head_wgs84/"))
}


# Aggregate impacts for highest-level livestock categories

#for a given impact type and livestock category, sum across rasters to yield total impact

for(j in names(LG_livestock_groupings)){
  print(j)
  
  # scale by aggregated livestock heads
  l.head.fs<-unlist(lapply(LG_livestock_groupings[[j]], function(l) {
    list.files(path = heads.path,pattern = l, full.names = T)
  }))
  
  agg.l.head<-sum(rast(l.head.fs), na.rm=T)
  
  #Reproject heads to Gall Peters, to match impacts
  agg_heads_gall_peters<-terra::aggregate(
                      project(disagg(agg.l.head/wgs84_pixel_areas, fact = 2, method = 'near'),
                              template_hi_res_gall_peters,method='near'),
                      fact = 2,fun = 'mean')*36
                    
  
  for(impact in impacts){
    print(impact)
  
    l.impact.fs<-unlist(lapply(LG_livestock_groupings[[j]], function(l) {
      grep(x = list.files(path = livestock.raw.path,pattern = paste0("farm_land_",l), full.names = T),pattern = impact, value = T)
    }))
    
    agg.l.impacts<-sum(rast(l.impact.fs), na.rm=T)
    
    
    #Calculate impact rate per head
    impact_per_head_gp<-agg.l.impacts/agg_heads_gall_peters
    impact_per_head_gp[is.infinite(impact_per_head_gp)]<-NA
    
    #Then project back to GLW wgs84 grid
    impact_per_head_wgs84<-terra::aggregate(
                              project(
                                disagg(impact_per_head_gp,fact = 2, method = "near"),
                                template_hi_res_wgs84,method='near'),
                              fact = 2, fun=mean,na.rm=T)
                            
    
    # write to file
    writeRaster(x = impact_per_head_wgs84,
                filename = paste0("livestock/",impact,"_per_head_wgs84/",j,"_per_head.tif"), overwrite=TRUE)
    

  }
  print("--------")
}
