export type MeetingFeatures = {
    Audio: {[key: string]: string};
  }
  
  export type CreateMeetingResponse = {
    MeetingFeatures: MeetingFeatures;
    MediaRegion: string;
  }
  
  export type JoinMeetingInfo = {
    Title: string;
    Meeting: CreateMeetingResponse;
    Attendee: string;
  }
  
  interface MeetingResponse {
    JoinInfo: JoinMeetingInfo;
  }
  
  interface GetAttendeeResponse {
    name: string;
  }
  
  export async function getPreparedMeeting(
    preparedApiEndpoint: string,
    meetingId: string,
    attendeeId: string
  ): Promise<MeetingResponse> {
    const meetingRes = await fetch(preparedApiEndpoint + '/' + meetingId, {
      method: 'GET',
    });
    const meetingData = await meetingRes.json();
    if (meetingData.error) {
      throw new Error(`Server error: Got ${meetingRes.status} from meeting <${meetingId}>`);
    }
    const attendeeRes = await fetch(preparedApiEndpoint + '/' + meetingId + '/attendees/' + attendeeId, {
      method: 'GET',
    });
    const attendeeData = await attendeeRes.json();
    if (attendeeData.error) {
      throw new Error(`Server error: Got ${attendeeRes.status} from attendee <${attendeeId}>`);
    }
    return {
      JoinInfo: {
        Title: meetingData.Meeting.ApplicationMetadata[meetingData.Meeting.ApplicationMetadata.MeetingType].name,
        Meeting: meetingData.Meeting,
        Attendee: attendeeData.Attendee,
      },
    };
  }
  
  export async function getPreparedAttendee(
    preparedApiEndpoint: string,
    meetingId: string,
    attendeeId: string
  ): Promise<GetAttendeeResponse> {
    const res = await fetch(preparedApiEndpoint + '/' + meetingId + '/attendees/' + attendeeId, {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error('Invalid server response');
    }
    const data = await res.json();
    return {
      name: data.Attendee.ApplicationMetadata[data.Attendee.ApplicationMetadata.AttendeeType].name,
    };
  }
  
  export async function endPreparedMeeting(
    preparedApiEndpoint: string,
    meetingId: string
  ): Promise<void> {
    const res = await fetch(preparedApiEndpoint + '/' + meetingId, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Server error ending prepared meeting');
    }
  }
  
  export const createGetPreparedAttendeeCallback = (preparedApiEndpoint: string, meetingId: string) =>
    (attendeeId: string): Promise<GetAttendeeResponse> =>
      getPreparedAttendee(preparedApiEndpoint, meetingId, attendeeId);