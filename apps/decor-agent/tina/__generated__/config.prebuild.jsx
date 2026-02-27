// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.TINA_BRANCH || "main";
var config_default = defineConfig({
  branch,
  // For Tina Cloud: set NEXT_PUBLIC_TINA_CLIENT_ID and TINA_TOKEN env vars
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "products",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "product",
        label: "S\u1EA3n ph\u1EA9m",
        path: "content/products",
        format: "md",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) => {
              return values?.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "new-product";
            }
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "T\xEAn s\u1EA3n ph\u1EA9m",
            isTitle: true,
            required: true
          },
          {
            type: "image",
            name: "image",
            label: "H\xECnh \u1EA3nh",
            required: true
          },
          {
            type: "string",
            name: "description",
            label: "M\xF4 t\u1EA3 / Review",
            ui: {
              component: "textarea"
            },
            required: true
          },
          {
            type: "string",
            name: "affiliateUrl",
            label: "Link affiliate (\u1EA9n kh\u1ECFi trang)",
            required: true
          },
          {
            type: "string",
            name: "category",
            label: "Danh m\u1EE5c",
            options: [
              { value: "lighting", label: "\u0110\xE8n / \xC1nh s\xE1ng" },
              { value: "furniture", label: "N\u1ED9i th\u1EA5t" },
              { value: "decor", label: "Decor / Trang tr\xED" },
              { value: "tech", label: "C\xF4ng ngh\u1EC7" }
            ],
            required: true
          },
          {
            type: "boolean",
            name: "featured",
            label: "Hi\u1EC3n th\u1ECB n\u1ED5i b\u1EADt"
          },
          {
            type: "rich-text",
            name: "body",
            label: "N\u1ED9i dung chi ti\u1EBFt",
            isBody: true
          }
        ]
      },
      {
        name: "profile",
        label: "Th\xF4ng tin c\xE1 nh\xE2n",
        path: "content",
        format: "md",
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        match: {
          include: "profile"
        },
        fields: [
          {
            type: "string",
            name: "name",
            label: "T\xEAn hi\u1EC3n th\u1ECB",
            required: true
          },
          {
            type: "image",
            name: "avatar",
            label: "\u1EA2nh \u0111\u1EA1i di\u1EC7n"
          },
          {
            type: "rich-text",
            name: "body",
            label: "Gi\u1EDBi thi\u1EC7u b\u1EA3n th\xE2n",
            isBody: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
