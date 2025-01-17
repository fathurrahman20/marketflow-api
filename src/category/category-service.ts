import { HTTPException } from "hono/http-exception";
import { prisma } from "../application/database";
import { CreateCategoryRequest, UpdateCategoryRequest } from "./category-model";
import { CategoryValidation } from "./category-validation";

export class CategoryService {
  static async get() {
    return await prisma.category.findMany({ include: { products: true } });
  }

  static async checkCategoryExists(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new HTTPException(404, { message: "Category is not found" });
    }

    return category;
  }

  static async checkCategoryDuplicate(name: string) {
    const brands = await prisma.category.findMany();

    brands.map((category) => {
      if (category.name.toLowerCase() === name.toLowerCase()) {
        throw new HTTPException(400, { message: "Category already exist " });
      }
    });

    return brands;
  }

  static async getById(id: number) {
    id = CategoryValidation.GET.parse(id);
    await this.checkCategoryExists(id);

    return await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
  }

  static async create(request: CreateCategoryRequest) {
    request = CategoryValidation.CREATE.parse(request);

    await this.checkCategoryDuplicate(request.name);

    const category = await prisma.category.create({
      data: request,
      include: { products: true },
    });

    return category;
  }

  static async update(request: UpdateCategoryRequest) {
    request = CategoryValidation.UPDATE.parse(request);
    await this.checkCategoryExists(request.id);
    if (request.name) {
      await this.checkCategoryDuplicate(request.name);
    }

    const updatedCategory = await prisma.category.update({
      where: { id: request.id },
      data: request,
      include: { products: true },
    });

    return updatedCategory;
  }

  static async delete(id: number) {
    id = CategoryValidation.DELETE.parse(id);

    await this.checkCategoryExists(id);

    return await prisma.category.delete({ where: { id } });
  }
}
