import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@vehicle-watchlist/database';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '@vehicle-watchlist/utils';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

    /**
     * Creates a new user with hashed password
     * @param registerDto - Data Transfer Object containing user registration data
     * @returns The created user document
     */
    async create(registerDto: RegisterDto): Promise<UserDocument> {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = new this.userModel({
            email: registerDto.email,
            password: hashedPassword,
            name: registerDto.name,
        });
        return user.save();
    }

    /**
     * Finds a user by their email address
     * @param email - The email address of the user to find
     * @returns The user document if found, otherwise null
     */
    async findOneByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    /**
     * Finds a user by their ID
     * @param id - The ID of the user to find
     * @returns The user document if found, otherwise null
     */
    async findOneById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    /**
     * Validates a plain password against a hashed password
     * @param plainPassword - The plain text password to validate
     * @param hashedPassword - The hashed password to compare against
     * @returns True if the passwords match, otherwise false
     */
    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Updates the user's refresh token
     * @param userId - The ID of the user
     * @param refreshToken - The refresh token to store (will be hashed)
     * @returns The updated user document
     */
    async updateRefreshToken(userId: string, refreshToken: string | null): Promise<UserDocument | null> {
        const hashedToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
        return this.userModel.findByIdAndUpdate(
            userId,
            { refreshToken: hashedToken },
            { new: true }
        ).exec();
    }
}
