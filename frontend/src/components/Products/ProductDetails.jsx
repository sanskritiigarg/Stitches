import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ProductGrid from './ProductGrid';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, fetchSimilarProducts } from '../../../redux/slices/productsSlice';
import { useParams, useNavigate } from 'react-router';
import { addToCart } from '../../../redux/slices/cartSlice';
import { CiStar } from 'react-icons/ci';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import axios from 'axios';

const ProductDetails = ({ productId }) => {
  const { id } = useParams();
  const { selectedProduct, similarProducts, loading, error } = useSelector(
    (state) => state.products,
  );
  const dispatch = useDispatch();
  const productFetchId = productId || id;
  const { user, guestId } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (productFetchId) {
      dispatch(fetchProductDetails(productFetchId));
      dispatch(fetchSimilarProducts({ id: productFetchId }));
    }
  }, [dispatch, productFetchId]);

  const [mainImage, setMainImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [ATCBtnDisabled, setATCBtnDisabled] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [writeReview, setWriteReview] = useState(false);
  const [review, setReview] = useState({
    rating: 1,
    comment: '',
  });
  const [productReviews, setProductReviews] = useState([]);

  useEffect(() => {
    const reviews = selectedProduct?.reviews;
    if (reviews) {
      setProductReviews(reviews);
    }
  }, [selectedProduct?.reviews]);

  useEffect(() => {
    if (selectedProduct?.images?.length > 0) {
      setMainImage(selectedProduct.images[0].url);
    }
  }, [selectedProduct]);

  const handleQuantityClick = (operation) => {
    if (operation === 'minus') {
      if (quantity > 1) setQuantity((prev) => prev - 1);
    } else setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast.error('Select Size and Color to add the product to cart', { duration: 1000 });
      return;
    }

    setATCBtnDisabled(true);

    dispatch(
      addToCart({
        productId: productFetchId,
        quantity,
        size: selectedSize,
        color: selectedColor,
        guestId,
        userId: user?._id,
      }),
    )
      .then(() => {
        toast.success('Product Added to Cart!', { duration: 1000 });
      })
      .finally(() => {
        setATCBtnDisabled(false);
      });
  };

  const handleReview = async () => {
    if (!user) {
      navigate(`/login?redirect=/products/${productFetchId}`);
      return;
    }

    if (writeReview) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/${productFetchId}/review`,
          review,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('userToken')}`,
            },
          },
        );

        toast.success('Review added successfully!', { duration: 1000 });

        setReview({ rating: 1, comment: '' });
        setProductReviews((prev) => [response.data.review, ...prev]);
      } catch (error) {
        console.log(error);

        if (error.status == 400) {
          toast.error(error.response.data.message, { duration: 2000 });
        } else {
          toast.error('Review cannot be added. Please try later.', { duration: 2000 });
        }
      }
    }
    setWriteReview(!writeReview);
  };

  const handleReviewDeletion = async (reviewId) => {
    try {
      if (window.confirm('Do you want to delete this review?')) {
        await axios({
          method: 'DELETE',
          url: `${import.meta.env.VITE_BACKEND_URL}/api/products/${productFetchId}/review/${reviewId}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          },
        });

        toast.success('Review Deleted Successfully', { duration: 1000 });
        const updateReviews = productReviews.filter(
          (productReview) => productReview._id !== reviewId,
        );
        setProductReviews(updateReviews);
      }
    } catch (error) {
      console.log(error);
      toast.error('Review cannot be deleted. Please try later', { duration: 1000 });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="p-6">
      {selectedProduct && (
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg">
          <div className="flex flex-col lg:flex-row">
            {/*Left Thumbnails */}
            <div className="hidden lg:flex flex-col space-y-4 mr-6">
              {selectedProduct.images.map((image, index) => (
                <img
                  src={image.url}
                  alt={image.altText || `Thumbnail ${index}`}
                  key={index}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${mainImage === image.url ? 'border-black' : 'border-white'}`}
                  onClick={() => {
                    setMainImage(image.url);
                  }}
                />
              ))}
            </div>

            {/*Main image */}
            {mainImage && (
              <div className="lg:w-1/2">
                <div className="mb-4">
                  <img
                    src={mainImage}
                    alt="Main Product"
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
              </div>
            )}

            {/*Mobile thumbnail */}
            <div className="lg:hidden flex overscroll-x-auto space-x-4 mb-4">
              {selectedProduct.images.map((image, index) => (
                <img
                  src={image.url}
                  alt={image.altText || `Thumbnail ${index}`}
                  key={index}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${mainImage === image.url ? 'border-black' : 'border-white'}`}
                  onClick={() => {
                    setMainImage(image.url);
                  }}
                />
              ))}
            </div>

            {/*Product details on right */}
            <div className="lg:w-1/2 lg:ml-10">
              <h1 className="text-2xl md:text-3xl font-semibold mb-2">{selectedProduct.name}</h1>
              {selectedProduct.rating && (
                <div className="flex border w-40 p-1 mb-2 rounded items-center">
                  <FaStar className="h-4 w-4 p-0.5"></FaStar>
                  <p className="pr-2 mr-2 border-r">{selectedProduct.rating.toFixed(1)}</p>
                  <p>{selectedProduct.numRatings} ratings</p>
                </div>
              )}
              <div className="w-28 grid grid-cols-2 gap-1 items-baseline">
                <p
                  className={`text-md text-gray-600 mb-1 ${selectedProduct.discountPrice ? 'line-through' : 'mb-4 text-lg'}`}
                >
                  {selectedProduct.price &&
                    `${selectedProduct.price.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}`}
                </p>
                <p className="text-gray-900 mb-4 text-">
                  {selectedProduct.discountPrice?.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>
              </div>
              <p className="text-gray-600 mb-4">{selectedProduct.description}</p>

              <div className="mb-4">
                <p className="text-gray-700">Color:</p>
                <div className="flex gap-2 mt-2">
                  {selectedProduct.colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-black' : 'border-gray-200'}`}
                      style={{
                        backgroundColor: color.toLocaleLowerCase(),
                        filter: 'brightness(0.8)',
                      }}
                      onClick={() => setSelectedColor(color)}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700">Size:</p>
                <div className="flex gap-2 mt-2">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size}
                      className={`px-4 py-2 rounded border ${selectedSize === size ? 'bg-black text-white' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">Quantity:</p>
                <div className="flex items-center space-x-4 mt-2">
                  <button
                    className="px-2 py-1 bg-gray-200 rounded text-lg"
                    onClick={() => handleQuantityClick('minus')}
                  >
                    -
                  </button>
                  <span className="text-lg w-4 text-center">{quantity}</span>
                  <button
                    className="px-2 py-1 bg-gray-200 rounded text-l"
                    onClick={() => handleQuantityClick('plus')}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className={`bg-black text-white py-2 px-6 rounded mb-4 w-full ${ATCBtnDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-800'}`}
                onClick={handleAddToCart}
                disabled={ATCBtnDisabled}
              >
                {ATCBtnDisabled ? 'Adding to Cart' : 'Add to Cart'}
              </button>
            </div>
          </div>

          {/* Reviews */}
          {id && (
            <div className="mt-15 ">
              {selectedProduct.rating && (
                <div className="flex text-xl items-center mb-4">
                  {[...Array(5)].map((_, index) => {
                    const rating = selectedProduct.rating;
                    const star = index + 1;

                    if (rating >= star) {
                      return <FaStar key={index} className="text-stitches"></FaStar>;
                    } else if (rating >= star - 0.5) {
                      return <FaStarHalfAlt key={index} className="text-stitches"></FaStarHalfAlt>;
                    } else {
                      return <CiStar key={index} className="text-stitches"></CiStar>;
                    }
                  })}

                  <p className="ml-2">{selectedProduct.rating.toFixed(1)}</p>
                  <p>/5</p>
                  <p className="ml-5 text-base">{selectedProduct.numRatings} ratings</p>
                </div>
              )}

              <hr className="mb-4 border-gray-400"></hr>

              {productReviews.length > 0 ? (
                <div className="space-y-2 overflow-auto h-48">
                  {productReviews.map((review) => (
                    <div key={review._id} className="p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-baseline mb-1">
                        <div className="flex grow">
                          <p className="font-medium">{review?.name}</p>

                          <div className="flex text-lg items-center px-4 text-stitches/90">
                            {[...Array(5)].map((_, index) => {
                              const rating = review.rating;
                              const star = index + 1;

                              if (rating >= star) {
                                return <FaStar key={index}></FaStar>;
                              } else if (rating >= star - 0.5) {
                                return <FaStarHalfAlt key={index}></FaStarHalfAlt>;
                              } else {
                                return <CiStar key={index}></CiStar>;
                              }
                            })}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                      {review.user == user?._id && (
                        <button
                          className="text-blue-900/80 text-sm mt-2 mr-2 underline hover:text-blue-900"
                          onClick={() => handleReviewDeletion(review._id)}
                        >
                          Delete Review
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No reviews for this product</p>
              )}

              <hr className="my-4 border-gray-400"></hr>

              {writeReview && (
                <div className="my-4">
                  <div className="flex text-2xl mb-4">
                    {[...Array(5)].map((_, index) => {
                      if (index < review.rating) {
                        return (
                          <button
                            key={index}
                            onClick={() => setReview({ ...review, rating: index + 1 })}
                          >
                            <FaStar key={index} className="text-stitches"></FaStar>
                          </button>
                        );
                      } else {
                        return (
                          <button
                            key={index}
                            onClick={() => setReview({ ...review, rating: index + 1 })}
                          >
                            <CiStar key={index} className="text-stitches"></CiStar>
                          </button>
                        );
                      }
                    })}
                  </div>
                  <textarea
                    placeholder="Write any comments (Optional)"
                    className="border w-full p-2"
                    value={review.comment}
                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  ></textarea>
                </div>
              )}

              <button
                className={`border py-1 px-3 rounded-full ${writeReview ? 'bg-stitches/90 text-white hover:bg-stitches' : 'hover:bg-gray-100'}`}
                onClick={handleReview}
              >
                {writeReview ? 'Submit' : 'Write a Review?'}
              </button>
            </div>
          )}

          <div className="mt-15">
            <h2 className="text-2xl font-medium text-center mb-4">You may also like</h2>
            <ProductGrid products={similarProducts} loading={loading} error={error} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
