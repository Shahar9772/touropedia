import { json } from 'express';
import TourModel from '../models/tour.js';
import UserModel from '../models/user.js';
import mongoose from 'mongoose';

export const createTour = async (req, res) => {
  const tour = req.body;

  const newTour = new TourModel({
    ...tour,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    await newTour.save();
    res.status(201).json(newTour);
  } catch (error) {
    res.status(404).json({
      message: 'Something went wrong when trying to create new tour',
    });
    console.error(error);
  }
};

export const getTours = async (req, res) => {
  const { page } = req.query;

  try {
    const limit = 6;
    const currentPage = Number(page);
    const startIndex = (currentPage - 1) * limit;

    const totalTours = await TourModel.countDocuments({});

    const tours = await TourModel.find().limit(limit).skip(startIndex);

    return res.json({
      data: tours,
      currentPage,
      totalTours,
      numberOfPages: Math.ceil(totalTours / limit),
    });
  } catch (error) {
    res.status(404).json({
      message: `Something went wrong when trying to fetch tours for page: ${page}`,
    });
    console.error(error);
  }
};

export const getToursBySearch = async (req, res) => {
  try {
    const { searchQuery } = req.query;

    const title = new RegExp(searchQuery, 'i');

    const tours = await TourModel.find({ title });

    return res.json(tours);
  } catch (error) {
    res.status(404).json({
      message: `Something went wrong when trying to fetch searched tours, searched word: ${searchQuery}`,
    });
    console.error(error);
  }
};

export const getRelatedTours = async (req, res) => {
  try {
    const tags = req.body;

    const tours = await TourModel.find({ tags: { $in: tags } });

    return res.json(tours);
  } catch (error) {
    res.status(404).json({
      message: `Something went wrong when trying to fetch tagged tours, tags is: ${tags}`,
    });
    console.error('hh', tags, error);
  }
};

export const getToursByTag = async (req, res) => {
  try {
    const { tag } = req.params;

    const tours = await TourModel.find({ tags: { $in: tag } });

    return res.json(tours);
  } catch (error) {
    res.status(404).json({
      message: `Something went wrong when trying to fetch tagged tours, tags is: ${tag}`,
    });
    console.error(error);
  }
};

export const getToursByUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: `user does not exist: ${id}` });
    }

    const userTours = await TourModel.find({ creator: id });
    return res.status(200).json(userTours);
  } catch (error) {
    res.status(404).json({
      message: `Something went wrong when trying to fetch all tours of user : ${id}`,
    });
    console.error(error);
  }
};

export const getTour = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await TourModel.findById(id);
    return res.status(200).json(tour);
  } catch (error) {
    res.status(404).json({
      message: `Something went wrong when trying to fetch tour with id : ${id}`,
    });
    console.error(error);
  }
};

export const deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: `Not Valid mongoose Id : ${id}` });
    }

    const DeletedTour = await TourModel.findByIdAndDelete(id);

    if (deleteTour) {
      return res.json({ message: `Tour Deleted Successfully ${id}` });
    } else {
      return res.status(404).json({ message: `No Tour exist with Id : ${id}` });
    }
  } catch (error) {
    res.status(404).json({
      message: `Something went wrong when trying to delete tour,  TourId : ${id}`,
    });
    console.error(error);
  }
};

export const updateTour = async (req, res) => {
  const { id } = req.params;
  const tour = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: `Not Valid mongoose Id : ${id}` });
    }

    const updatedRecord = await TourModel.findByIdAndUpdate(id, tour, {
      new: true,
    });

    if (updatedRecord) {
      return res.json(updatedRecord);
    } else {
      return res.status(404).json({ message: `No Tour exist with Id : ${id}` });
    }
  } catch (error) {
    res.status(404).json({
      message: `Something went wrong when trying to update tour,  TourId : ${id}`,
    });
    console.error(error);
  }
};

export const likeTour = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  try {
    if (!userId) {
      return res.status(404).json({ message: 'User is not authenticated' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ message: `Not Valid mongoose Id (of tour) : ${id}` });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({
        message: `Not Valid mongoose Id (of user that like) : ${userId}`,
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User who likes doesn't exist" });
    }

    const tour = await TourModel.findById(id);
    if (!tour) {
      return res.status(404).json({ message: `tour not exist in db ${id}` });
    }

    const userIdx = tour.likes.findIndex((id) => id === String(userId));

    if (userIdx === -1) {
      tour.likes.push(userId);
    } else {
      tour.likes = tour.likes.filter((id) => id !== String(userId));
    }

    const updatedRecord = await tour.save();

    // const updatedRecord = await TourModel.updateOne(
    //   { _id: id, likes: { $ne: userId } },
    //   { $addToSet: { likes: userId } },
    //   { new: true }
    // );

    if (updatedRecord) {
      return res.json(updatedRecord);
    } else {
      return res.status(404).json({ message: `No Tour exist with Id : ${id}` });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
    console.error(error);
  }
};
