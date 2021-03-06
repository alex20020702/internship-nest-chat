import {
	Body,
	Controller,
	Post,
	Request,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBody,
	ApiCreatedResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { PrivateUser } from 'src/user/dto/user.private.dto';

import { Role } from 'src/user/enums/user.role.enum';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { loginUserDto } from './dto/login.dto';
import { registerUserDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
	) {}

	@Post('/login')
	@UseGuards(LocalAuthGuard)
	@ApiBody({ type: loginUserDto })
	async login(@Request() { user }) {
		return this.authService.login(user);
	}

	@Post('/login-token')
	async loginByToken(@Body() tokens: { refresh_token: string }) {
		const user = await this.authService.checkToken(tokens.refresh_token);
		if (user) {
			return this.authService.login(user);
		}
		throw new UnauthorizedException();
	}

	@Post('/register')
	@ApiOperation({ description: 'Create a new user' })
	@ApiBody({
		type: registerUserDto,
		description: 'The user to be created',
	})
	@ApiCreatedResponse({
		status: 201,
		type: PrivateUser,
		description: 'The new User document',
	})
	async register(@Body() newUser: registerUserDto) {
		newUser.role = Role.User;
		const { _id } = await this.userService.addOne(newUser);
		const user = await this.userService.findOneById(_id);
		return this.authService.login(user);
	}

	@Post('/self')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ description: 'Returns current authenticated user' })
	async private(@Request() { sub: id }: { sub: Types.ObjectId }) {
		return await this.userService.findOneById(id);
	}
}
