import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateRoomDto, UpdateRoomDto } from './room.dto';
import { Room, RoomDocument } from './room.schema';

@Injectable()
export class RoomService {
	constructor(@InjectModel(Room.name) private RoomModel: Model<RoomDocument>) {}

	async findAll(): Promise<Room[]> {
		return this.RoomModel.find().lean().exec();
	}
	async findAllByMember(userId: string): Promise<Room[]> {
		const query: any = { users: userId };
		return this.RoomModel.find(query)
			.populate('users')
			.populate('owner')
			.lean()
			.exec();
	}
	async findAllByOwner(userId: string): Promise<Room[]> {
		const query: any = { owner: userId };
		return this.RoomModel.find(query)
			.populate('users')
			.populate('owner')
			.lean()
			.exec();
	}

	async findById(id: string): Promise<Room> {
		return this.RoomModel.findById(id)
			.populate('users')
			.populate('owner')
			.lean()
			.exec();
	}
	async findByName(name: string): Promise<Room[]> {
		return this.RoomModel.find({ name })
			.populate('users')
			.populate('owner')
			.lean()
			.exec();
	}

	async addOne(newRoom: CreateRoomDto) {
		const room = new this.RoomModel(newRoom);
		room._id = Types.ObjectId();
		return room.save();
	}

	async updateOne(id: string, newRoom: UpdateRoomDto) {
		const room = await this.RoomModel.findById(id);
		room.set(newRoom);
		return room.save();
	}

	async addUser(id: string, user: string) {
		const room = await this.RoomModel.findById(id);
		room.users.push(user as any);
		return room.save();
	}

	async removeUser(id: string, userId: string) {
		const room = await this.RoomModel.findById(id);
		const userOId: Types.ObjectId = new Types.ObjectId(userId);
		room.users.splice(
			room.users.findIndex((el) => el._id.equals(userOId)),
			1,
		);
		return room.save();
	}
}
