import { Expose,Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class oracleDto {
    id: string;
    @Type(() => Number)
    idx: number;
    idxList: any;
    @Type(() => Number)
    genreIdx: number;
    musician: string;
    music_publisher: string;
    song_thumbnail: string;
    op_neighboring_token_address: string;
    icp_neighboring_token_address: string;
    @Type(() => Number)
    album_idx: number;
    arranger: string;
    requester_principal: string;
    @Type(() => Number)
    unlock_total_count: number;
    unlock_count_list: any;
    requestName:string;
    can_approve: boolean;
    address: string;
    partnerIdx: number;
    partner_name: string;
    unlock_date: string;
    unlocked_at: string;
    amount: number;
    etherAmount: string;
    year: number;
    month: number;
    startTs: number;
    endTs: number;
    mintType: string;
    principal: string;
    type: string;
}