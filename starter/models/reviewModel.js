//review /rating /createdAt /ref to tour /ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModels');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour'],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({tour:1,user:1},{unique:true})

reviewSchema.pre(/^find/, function (next) {
  this
    // .populate({
    //   path: 'tour',
    //   select: 'name',
    // })
    .populate({
      path: 'user',
      select: 'name photo',
    });
  next();
});

// ***************************CALCULATING AVERAGE RATIONGS ON TOURS********************

// created a static metho basically for calculating a statistics of average
// and number of ratings fro the tour ID for which the current review was
// created and we created this  function as a static method because we
// need to call the aggregate function on the model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    // THIS IS KNOWN AS THE AGGREGATION PIPELINE
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
}

reviewSchema.post('save', function () {
  //  this points to current review
  this.constructor.calcAverageRatings(this.tour);
});
//  SAVING THE STATISTICS TO THE CURRENT TOUR
// };

//  IN ORDER TO ACTUALLY USE THIS ABOVE FUNCTION WE CALL IT
//  AFTER A NEW REVIEW HAS BEEN CREATED

/* ***********CALCULATING REVIEW STATISTICS FOR A REVIEW
BEING UPDATED OR DELETED*******************/

/* findByIdAndDelete  and  findByIdAndUpdate are the methods to do so but we
don't have any document middleware we only have querymiddleware and in query
we donot have direct access to document in order to do something similar to
this  this.constructor.calcAverageRatings(this.tour);
************to overcome the above we do the following******************/



reviewSchema.pre(/^findOneAnd/, async function (next) {
  /////////////execute and get the query//////////////////
  /* the goals is to get access to the current review and the this
  keyword refers to the  current query*/
  this.r = await this.findOne().clone(); // here r refers to review .clone
  //over here is used to overcome the
  //error of *QUERY WAS ALREADY EXECUTED*
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne() doesnot work here query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
