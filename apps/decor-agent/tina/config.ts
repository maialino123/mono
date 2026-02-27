import { defineConfig } from "tinacms";

const branch = process.env.TINA_BRANCH || 'main';

export default defineConfig({
  branch,
  // For Tina Cloud: set NEXT_PUBLIC_TINA_CLIENT_ID and TINA_TOKEN env vars
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "products",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      {
        name: "product",
        label: "Sản phẩm",
        path: "content/products",
        format: "md",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) => {
              return values?.title
                ?.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '') || 'new-product';
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Tên sản phẩm",
            isTitle: true,
            required: true,
          },
          {
            type: "image",
            name: "image",
            label: "Hình ảnh",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Mô tả / Review",
            ui: {
              component: "textarea",
            },
            required: true,
          },
          {
            type: "string",
            name: "affiliateUrl",
            label: "Link affiliate (ẩn khỏi trang)",
            required: true,
          },
          {
            type: "string",
            name: "category",
            label: "Danh mục",
            options: [
              { value: "lighting", label: "Đèn / Ánh sáng" },
              { value: "furniture", label: "Nội thất" },
              { value: "decor", label: "Decor / Trang trí" },
              { value: "tech", label: "Công nghệ" },
            ],
            required: true,
          },
          {
            type: "boolean",
            name: "featured",
            label: "Hiển thị nổi bật",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Nội dung chi tiết",
            isBody: true,
          },
        ],
      },
      {
        name: "profile",
        label: "Thông tin cá nhân",
        path: "content",
        format: "md",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        match: {
          include: "profile",
        },
        fields: [
          {
            type: "string",
            name: "name",
            label: "Tên hiển thị",
            required: true,
          },
          {
            type: "image",
            name: "avatar",
            label: "Ảnh đại diện",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Giới thiệu bản thân",
            isBody: true,
          },
        ],
      },
    ],
  },
});
