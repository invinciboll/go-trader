import React, { useEffect, useState } from "react";
import { Button, Flex, Modal, Steps } from "antd";
import {
  AdbDaemonWebUsbConnection,
  AdbDaemonWebUsbDevice,
  AdbDaemonWebUsbDeviceManager,
} from "@yume-chan/adb-daemon-webusb";
import type { StepsProps } from "antd";
import { Adb, AdbDaemonTransport } from "@yume-chan/adb";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import type { DeviceBusyError } from "@yume-chan/adb-daemon-webusb/esm/error";

interface ConnectStepsProps {
  setAdb: (adb: Adb | null) => void;
  adb: Adb | null;
}

const ConnectSteps: React.FC<ConnectStepsProps> = ({ setAdb, adb }) => {
  const Manager = AdbDaemonWebUsbDeviceManager.BROWSER; // undefined if no WebUSB support
  const [device, setDevice] = useState<AdbDaemonWebUsbDevice | undefined>(
    undefined,
  );
  const [connection, setConnection] =
    useState<AdbDaemonWebUsbConnection | null>(null);

  const progress = !Manager ? 0 : !device || !connection ? 1 : !adb ? 2 : 3;
  const status: StepsProps["status"] = !Manager
    ? "error"
    : adb
      ? "finish"
      : "wait";

  const selectDevice = async () => {
    if (Manager) {
      const dev = await Manager.requestDevice(); // shows browser USB picker
      try {
        const con = await dev?.connect(); // throws DeviceBusyError if ADB is already open
        if (dev && con) {
          setDevice(dev);
          setConnection(con);
        }
      } catch (error: unknown) {
        Modal.error({
          title: "error",
        });
      }
    }
  };

  const authenticate = async () => {
    if (!device || !connection) return;
    const modal = Modal.info({
      title: "Check your device",
      content:
        "A connection request should appear on your Android device. Tap 'Allow' to authorize ADB access.",
      footer: null,
      maskClosable: false,
    });

    try {
      const transport = await AdbDaemonTransport.authenticate({
        serial: device.serial,
        connection,
        credentialStore: new AdbWebCredentialStore("GoTrader"),
      });
      const adb = new Adb(transport);
      setAdb(adb);
    } finally {
      modal.destroy();
    }
  };

  const items = [
    {
      title: "Browser Compatible",
      content: "Chromium based browser required.",
    },
    {
      title: device ? `${device.name} selected` : "Select Device",
      content: (
        <Button disabled={progress !== 1} onClick={selectDevice}>
          Select
        </Button>
      ),
    },
    {
      title: adb ? "Authenticated" : "Authenticate Adb",
      content: (
        <Button disabled={progress !== 2} onClick={authenticate}>
          Auth
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (!Manager || !device) return;

    let observer: Awaited<ReturnType<typeof Manager.trackDevices>> | null =
      null;

    const setup = async () => {
      observer = await Manager.trackDevices();
      observer.onDeviceRemove((removedDevices) => {
        const wasOurDevice = removedDevices.some(
          (d) => d.serial === device.serial,
        );
        if (wasOurDevice) {
          setAdb(null);
          setConnection(null);
          setDevice(undefined);
        }
      });
    };

    setup();

    return () => {
      observer?.stop();
    };
  }, [device]);

  return (
    <Flex vertical gap="large">
      <Steps
        // orientation="vertical"
        current={progress}
        items={items}
        status={status}
      />
    </Flex>
  );
};

export default ConnectSteps;
