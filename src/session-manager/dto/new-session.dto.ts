import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Max, Min } from "class-validator";

export class NewSessionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    // describe in second for close the session if room is empty
    @IsNumber()
    @Min(300)
    @Max(900)
    emptyTimeout: number;

    @IsNumber()
    @Min(2)
    @Max(20)
    maxParticipants: number;


    // describe in second for close the session beacase session should be terminated
    @IsNumber()
    @Min(10 * 60) //10 minute for room to be empty then session would expire
    @Max(120 * 60) ////2 hour for room to be empty then session would expire
    sessionExpiry: number;

    @IsObject()
    metadata: Record<string, any>;

}