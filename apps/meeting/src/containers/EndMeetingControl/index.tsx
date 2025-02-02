// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ControlBarButton,
  Phone,
  Modal,
  ModalBody,
  ModalHeader,
  ModalButton,
  ModalButtonGroup,
  useLogger,
} from 'amazon-chime-sdk-component-library-react';

import { endMeeting } from '../../utils/api';
import { endPreparedMeeting } from '../../utils/preparedApi';
import { StyledP } from './Styled';
import { useAppState } from '../../providers/AppStateProvider';
import routes from '../../constants/routes';

const EndMeetingControl: React.FC = () => {
  const logger = useLogger();
  const [showModal, setShowModal] = useState(false);
  const toggleModal = (): void => setShowModal(!showModal);
  const { meetingId } = useAppState();
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);

  const leaveMeeting = async (): Promise<void> => {
    if (params.has('preparedApiEndpoint') && params.has('preparedMeetingId') && params.has('preparedAttendeeId')) {
      navigate(`${routes.HOME}?${params.toString()}`);
    } else {
      navigate(routes.HOME);
    }
  };

  const endMeetingForAll = async (): Promise<void> => {
    try {
      if (meetingId) {
        const preparedApiEndpoint = params.get('preparedApiEndpoint');
        const preparedMeetingId = params.get('preparedMeetingId');
        if (preparedApiEndpoint && preparedMeetingId) {
          await endPreparedMeeting(preparedApiEndpoint, preparedMeetingId);
          navigate(`${routes.HOME}?${params.toString()}`);
        } else {
          await endMeeting(meetingId);
          navigate(routes.HOME);
        }
      }
    } catch (e) {
      logger.error(`Could not end meeting: ${e}`);
    }
  };

  return (
    <>
      <ControlBarButton icon={<Phone />} onClick={toggleModal} label="Leave" />
      {showModal && (
        <Modal size="md" onClose={toggleModal} rootId="modal-root">
          <ModalHeader title="End Meeting" />
          <ModalBody>
            <StyledP>
              Leave meeting or you can end the meeting for all. The meeting
              cannot be used once it ends.
            </StyledP>
          </ModalBody>
          <ModalButtonGroup
            primaryButtons={[
              <ModalButton
                key="end-meeting-for-all"
                onClick={endMeetingForAll}
                variant="primary"
                label="End meeting for all"
                closesModal
              />,
              <ModalButton
                key="leave-meeting"
                onClick={leaveMeeting}
                variant="primary"
                label="Leave Meeting"
                closesModal
              />,
              <ModalButton key="cancel-meeting-ending" variant="secondary" label="Cancel" closesModal />,
            ]}
          />
        </Modal>
      )}
    </>
  );
};

export default EndMeetingControl;
