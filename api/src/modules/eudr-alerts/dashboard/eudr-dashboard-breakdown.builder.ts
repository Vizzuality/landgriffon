type Entities = {
  supplierId: string;
  supplierName: string;
  companyId: string;
  adminRegionId: string;
  adminRegionName: string;
  materialId: string;
  materialName: string;
  totalBaselineVolume: number;
  geoRegionCount: number;
};

export class EUDRBreakDown {
  public materials: {
    'Deforestation-free suppliers': {
      totalPercentage: number;
      detail: { name: string; value: number }[];
    };
    'Suppliers with deforestation alerts': {
      totalPercentage: number;
      detail: { name: string; value: number }[];
    };
    'Suppliers with no location data': {
      totalPercentage: number;
      detail: { name: string; value: number }[];
    };
  };

  public origins: {
    'Deforestation-free suppliers': {
      totalPercentage: number;
      detail: { name: string; value: number }[];
    };
    'Suppliers with deforestation alerts': {
      totalPercentage: number;
      detail: { name: string; value: number }[];
    };
    'Suppliers with no location data': {
      totalPercentage: number;
      detail: { name: string; value: number }[];
    };
  };

  soucingData: any[];
  alertData: any;

  materialsBySupplier: Map<string, any> = new Map();
  originsBySupplier: Map<string, any> = new Map();
  materialSuppliersMap: Map<string, any> = new Map();
  originSuppliersMap: Map<string, any> = new Map();

  sourcingDataTransformedMap: Map<string, any> = new Map();

  constructor(sourcingData: any, alertData: any) {
    this.soucingData = sourcingData;
    this.alertData = alertData;
    this.buildMaps();
  }

  buildMaps(): void {
    this.soucingData.forEach((entity: Entities) => {
      const {
        supplierId,
        materialId,
        materialName,
        geoRegionCount,
        adminRegionId,
        adminRegionName,
      } = entity;
      if (!this.materialsBySupplier.has(supplierId)) {
        this.materialsBySupplier.set(supplierId, []);
        this.originsBySupplier.set(supplierId, []);
      }

      this.materialsBySupplier.get(supplierId).push({
        materialName: materialName,
        id: materialId,
      });

      this.originsBySupplier.get(supplierId).push({
        originName: adminRegionName,
        id: adminRegionId,
      });
      if (!this.materialSuppliersMap.has(materialId)) {
        this.materialSuppliersMap.set(materialId, {
          materialName,
          suppliers: new Set(),
          zeroGeoRegionSuppliers: 0,
          dfsSuppliers: 0,
          sdaSuppliers: 0,
          tplSuppliers: 0,
        });
      }
      if (!this.originSuppliersMap.has(adminRegionId)) {
        this.originSuppliersMap.set(adminRegionId, {
          originName: adminRegionName,
          suppliers: new Set(),
          zeroGeoRegionSuppliers: 0,
          dfsSuppliers: 0,
          sdaSuppliers: 0,
          tplSuppliers: 0,
        });
      }
      const material: {
        materialName: string;
        suppliers: Set<any>;
        zeroGeoRegionSuppliers: number;
        dfsSuppliers: number;
        sdaSuppliers: number;
        tplSuppliers: number;
      } = this.materialSuppliersMap.get(materialId);
      const origin: {
        originName: string;
        suppliers: Set<any>;
        zeroGeoRegionSuppliers: number;
        dfsSuppliers: number;
        sdaSuppliers: number;
        tplSuppliers: number;
      } = this.originSuppliersMap.get(adminRegionId);
      material.suppliers.add(supplierId);
      origin.suppliers.add(supplierId);
      if (geoRegionCount === 0) {
        material.zeroGeoRegionSuppliers += 1;
        origin.zeroGeoRegionSuppliers += 1;
      }
      if (this.alertData[supplierId].dfs > 0) {
        material.dfsSuppliers += 1;
        origin.dfsSuppliers += 1;
      }
      if (this.alertData[supplierId].sda > 0) {
        material.sdaSuppliers += 1;
        origin.sdaSuppliers += 1;
      }
      if (this.alertData[supplierId].tpl > 0) {
        material.tplSuppliers += 1;
        origin.tplSuppliers += 1;
      }
    });
  }

  getmaterialSuppliersMap(): Map<string, any> {
    return this.materialSuppliersMap;
  }

  getoriginSuppliersMap(): Map<string, any> {
    return this.originSuppliersMap;
  }
}
