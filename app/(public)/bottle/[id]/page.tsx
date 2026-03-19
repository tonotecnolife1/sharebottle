import { notFound } from "next/navigation";
import { getBottleDetail } from "@/features/bottle-detail/actions";
import { BottleHero } from "@/features/bottle-detail/components/bottle-hero";
import { BottleInfo } from "@/features/bottle-detail/components/bottle-info";
import { OrderGuide } from "@/features/bottle-detail/components/order-guide";

export default async function BottleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const bottle = await getBottleDetail(params.id);

  if (!bottle) {
    notFound();
  }

  return (
    <div className="animate-fade-in">
      <BottleHero imageUrl={bottle.image_url} isPopular={bottle.is_popular} />

      <div className="px-4 pt-8">
        <BottleInfo bottle={bottle} />

        <div className="mt-6">
          <OrderGuide
            instructions={bottle.order_instructions}
            deliveryTime={bottle.delivery_time}
          />
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
