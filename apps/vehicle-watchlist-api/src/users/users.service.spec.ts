import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserDocument } from '@vehicle-watchlist/database';

jest.mock('bcrypt');

describe('UsersService', () => {
    let service: UsersService;
    let userModel: Model<UserDocument>;

    const mockUserDocument = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        isActive: true,
        refreshToken: null,
        save: jest.fn(),
    };

    const mockUserModel = {
        new: jest.fn().mockResolvedValue(mockUserDocument),
        constructor: jest.fn().mockResolvedValue(mockUserDocument),
        findOne: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        create: jest.fn(),
    };

    // Mock constructor for new this.userModel()
    function MockUserModel(data: Partial<User>) {
        return {
            ...data,
            save: jest.fn().mockResolvedValue({
                _id: '507f1f77bcf86cd799439011',
                ...data,
            }),
        };
    }
    MockUserModel.findOne = mockUserModel.findOne;
    MockUserModel.findById = mockUserModel.findById;
    MockUserModel.findByIdAndUpdate = mockUserModel.findByIdAndUpdate;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken(User.name),
                    useValue: MockUserModel,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new user with hashed password', async () => {
            const registerDto = {
                email: 'test@example.com',
                password: 'Test1234',
                name: 'Test User',
            };

            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

            const result = await service.create(registerDto);

            expect(bcrypt.hash).toHaveBeenCalledWith('Test1234', 10);
            expect(result).toHaveProperty('email', 'test@example.com');
            expect(result).toHaveProperty('name', 'Test User');
        });
    });

    describe('findOneByEmail', () => {
        it('should find a user by email', async () => {
            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUserDocument),
            });

            const result = await service.findOneByEmail('test@example.com');

            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(result).toEqual(mockUserDocument);
        });

        it('should return null if user not found', async () => {
            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await service.findOneByEmail('notfound@example.com');

            expect(result).toBeNull();
        });
    });

    describe('findOneById', () => {
        it('should find a user by id', async () => {
            mockUserModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUserDocument),
            });

            const result = await service.findOneById('507f1f77bcf86cd799439011');

            expect(mockUserModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(result).toEqual(mockUserDocument);
        });

        it('should return null if user not found', async () => {
            mockUserModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await service.findOneById('nonexistentid');

            expect(result).toBeNull();
        });
    });

    describe('validatePassword', () => {
        it('should return true for valid password', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validatePassword('plainPassword', 'hashedPassword');

            expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
            expect(result).toBe(true);
        });

        it('should return false for invalid password', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await service.validatePassword('wrongPassword', 'hashedPassword');

            expect(result).toBe(false);
        });
    });

    describe('updateRefreshToken', () => {
        it('should update refresh token with hashed value', async () => {
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
            mockUserModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({
                    ...mockUserDocument,
                    refreshToken: 'hashedRefreshToken',
                }),
            });

            const result = await service.updateRefreshToken(
                '507f1f77bcf86cd799439011',
                'newRefreshToken'
            );

            expect(bcrypt.hash).toHaveBeenCalledWith('newRefreshToken', 10);
            expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439011',
                { refreshToken: 'hashedRefreshToken' },
                { new: true }
            );
            expect(result?.refreshToken).toBe('hashedRefreshToken');
        });

        it('should set refresh token to null when null is passed', async () => {
            mockUserModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({
                    ...mockUserDocument,
                    refreshToken: null,
                }),
            });

            const result = await service.updateRefreshToken('507f1f77bcf86cd799439011', null);

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439011',
                { refreshToken: null },
                { new: true }
            );
            expect(result?.refreshToken).toBeNull();
        });
    });
});
