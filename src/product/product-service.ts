import { HTTPException } from "hono/http-exception";
import { prisma } from "../application/database";
import { ProductValidation } from "./product-validation";
import { CreateProductRequest, UpdateProductRequest } from "./prodect-model";
import { Context } from "hono";
import { encodeBase64 } from "hono/utils/encode";
import { v2 as cloudinary } from "cloudinary";
import { fromError } from "zod-validation-error";
import { randomUUIDv7 } from "bun";

export class ProductService {
  static async get() {
    return await prisma.product.findMany({
      include: { brand: true, category: true, reviews: true },
    });
  }

  static async checkProductExists(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new HTTPException(404, { message: "Product is not found" });
    }

    return product;
  }

  static async checkProductDuplicate(slug: string) {
    const product = await prisma.product.findUnique({ where: { slug } });

    if (!product) {
      throw new HTTPException(400, { message: "Product already exist" });
    }

    return product;
  }

  static async getProduct(id: number) {
    id = ProductValidation.GET.parse(id);
    await this.checkProductExists(id);

    return await prisma.product.findUnique({
      where: { id },
      include: { brand: true, category: true, reviews: true },
    });
  }

  static async create(c: Context) {
    const formData = await c.req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;
    const price = formData.get("price");
    const brandId = formData.get("brandId");
    const categoryId = formData.get("categoryId");
    const byteArrayBuffer = await file.arrayBuffer();
    const base64 = encodeBase64(byteArrayBuffer);
    const uniqueId = randomUUIDv7().split("-")[0];

    const image = {
      id: "",
      url: "",
    };

    const payload: CreateProductRequest = {
      name,
      description,
      image,
      price: Number(price),
      brandId: Number(brandId),
      categoryId: Number(categoryId),
      slug: `${name?.trim().split(" ").join("-")}-${uniqueId}`,
    };
    const { error } = ProductValidation.CREATE.safeParse(payload);

    if (error) {
      throw new HTTPException(400, { message: fromError(error).toString() });
    }

    const url = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64}`
    );

    payload.image = {
      id: url.public_id,
      url: url.url,
    };

    const product = await prisma.product.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        price: payload.price,
        brandId: payload.brandId,
        categoryId: payload.categoryId,
        imageId: payload.image.id,
        imageUrl: payload.image.url,
      },
      include: { brand: true, category: true },
    });

    return product;
  }

  static async update(c: Context) {
    const id = Number(c.req.param("id"));

    const formData = await c.req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;
    const price = formData.get("price");
    const brandId = formData.get("brandId");
    const categoryId = formData.get("categoryId");
    const byteArrayBuffer = await file?.arrayBuffer();
    const base64 = encodeBase64(byteArrayBuffer);
    const uniqueId = randomUUIDv7().split("-")[0];

    const image = {
      id: "",
      url: "",
    };

    const product = await prisma.product.findUnique({ where: { id } });

    const payload: UpdateProductRequest = {
      name: name ? name : product?.name,
      description: description ? description : product?.description,
      image,
      price: price ? Number(price) : product?.price,
      brandId: brandId ? Number(brandId) : product?.brandId,
      categoryId: categoryId ? Number(categoryId) : product?.categoryId,
      slug: name
        ? `${name?.trim().split(" ").join("-")}-${uniqueId}`
        : product?.slug,
    };

    const { error } = ProductValidation.UPDATE.safeParse(payload);

    if (error) {
      throw new HTTPException(400, { message: fromError(error).toString() });
    }

    if (base64) {
      if (product?.imageId) {
        await cloudinary.uploader.destroy(product.imageId, (result) => result);
      }
      const url = await cloudinary.uploader.upload(
        `data:image/png;base64,${base64}`
      );

      payload.image = {
        id: url.public_id,
        url: url.url,
      };
    }

    if (name) {
      await this.checkProductDuplicate(name?.trim().split(" ").join("-"));
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        price: payload.price,
        brandId: payload.brandId,
        categoryId: payload.categoryId,
        imageId: payload?.image?.id,
        imageUrl: payload?.image?.url,
      },
      include: { brand: true, category: true },
    });

    return updatedProduct;
  }

  static async deleteProduct(id: number) {
    await this.checkProductExists(id);
    await prisma.product.delete({ where: { id } });

    return true;
  }

  static async deleteProducts() {
    await prisma.product.deleteMany();
    return true;
  }
}
