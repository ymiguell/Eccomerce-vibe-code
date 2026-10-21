import ProductCard from './ProductCard.jsx'

function FeaturedProducts({ products }) {
  return (
    <section aria-labelledby="featured-title" className="mx-auto mt-12 max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8">
      <h2 id="featured-title" className="text-3xl font-semibold sm:text-4xl">
        Destaques
      </h2>

      {/* Celular: 1 coluna · tablet pequeno: 2 · tablet/desktop: 3 */}
      <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-8">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default FeaturedProducts
