-- Serviço de frete escolhido no pedido (ex.: "Correios PAC"); vazio nos pedidos anteriores
ALTER TABLE "orders" ADD COLUMN "shipping_service" TEXT NOT NULL DEFAULT '';
