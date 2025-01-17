import { HTTPException } from "hono/http-exception";
import { prisma } from "../application/database";
import { CreateBrandRequest, UpdateBrandRequest } from "./brand-model";
import { BrandValidation } from "./brand-validation";

export class BrandService {
  static async get() {
    return await prisma.brand.findMany({ include: { products: true } });
  }

  static async checkBrandExists(id: number) {
    const brand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new HTTPException(404, { message: "Brand is not found" });
    }

    return brand;
  }

  static async checkBrandDuplicate(name: string) {
    const brands = await prisma.brand.findMany();

    brands.map((brand) => {
      if (brand.name.toLowerCase() === name.toLowerCase()) {
        throw new HTTPException(400, { message: "Brand already exist " });
      }
    });

    return brands;
  }

  static async getById(id: number) {
    id = BrandValidation.GET.parse(id);
    await this.checkBrandExists(id);

    return await prisma.brand.findUnique({
      where: { id },
      include: { products: true },
    });
  }

  static async create(request: CreateBrandRequest) {
    request = BrandValidation.CREATE.parse(request);

    await this.checkBrandDuplicate(request.name);

    const brand = await prisma.brand.create({
      data: request,
      include: { products: true },
    });

    return brand;
  }

  static async update(request: UpdateBrandRequest) {
    request = BrandValidation.UPDATE.parse(request);
    await this.checkBrandExists(request.id);
    if (request.name) {
      await this.checkBrandDuplicate(request.name);
    }

    const updatedBrand = await prisma.brand.update({
      where: { id: request.id },
      data: request,
      include: { products: true },
    });

    return updatedBrand;
  }

  static async delete(id: number) {
    id = BrandValidation.DELETE.parse(id);

    await this.checkBrandExists(id);

    return await prisma.brand.delete({ where: { id } });
  }
}
