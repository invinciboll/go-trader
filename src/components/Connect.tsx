import React, { useEffect, useState } from "react";
import { App, Button, Steps, Typography } from "antd";
import {
  AdbDaemonWebUsbConnection,
  AdbDaemonWebUsbDevice,
  AdbDaemonWebUsbDeviceManager,
} from "@yume-chan/adb-daemon-webusb";
import type { StepsProps } from "antd";
import { Adb, AdbDaemonTransport } from "@yume-chan/adb";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import { useAdb } from "../api/adb/useAdb";
import { useTradeMachine } from "../api/statemachine/useTradeMachine";
import { useLogger } from "../api/logger/logger";
import { useOpenCv } from "../api/opencv/useOpenCv";



const ConnectSteps: React.FC = () => {
  const Manager = AdbDaemonWebUsbDeviceManager.BROWSER; // undefined if no WebUSB support
  const [device, setDevice] = useState<AdbDaemonWebUsbDevice | undefined>(
    undefined,
  );
  const [connection, setConnection] =
    useState<AdbDaemonWebUsbConnection | null>(null);

  const { modal } = App.useApp();
  const { reset } = useTradeMachine();
  const { clear } = useLogger();
  const { deinitialize } = useOpenCv();
  const { initialize: setAdb, deinitialize: unsetAdb, isReady: adbReady } = useAdb();

  const progress = !Manager ? 0 : !device || !connection ? 1 : !adbReady ? 2 : 3;
  const status: StepsProps["status"] = !Manager
    ? "error"
    : adbReady
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
        console.error(error);
        // Modal.error({
        //     title: "error"
        //   }
        // });
      }
    }
  };

  const authenticate = async () => {
    if (!device || !connection) return;
    const infoModal = modal.info({
      title: "Check your device",
      content:
        "A connection request should appear on your Android device. Tap 'Allow' to authorize ADB access.",
      footer: null,
      mask: {
        closable: false
      },
    });

    try {
      const transport = await AdbDaemonTransport.authenticate({
        serial: device.serial,
        connection,
        credentialStore: new AdbWebCredentialStore("GoTrader"),
      });
      const adb = new Adb(transport);
      setAdb(adb);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 50);
    } finally {
      infoModal.destroy();
    }
  };

  const items = [
    {
      title: "Browser Compatible",
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
      title: adbReady ? "Authenticated" : "Authenticate Adb",
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
          unsetAdb();
          setConnection(null);
          setDevice(undefined);
          clear();
          reset();
          deinitialize()
        }
      });
    };
    setup();

    return () => {
      observer?.stop();
    };
  }, [device]);

  return (
    <>
      <Typography.Title level={3}>Connect a device to continue</Typography.Title>
      <Steps
        current={progress}
        items={items}
        status={status}
      />
    </>
  );
};

export default ConnectSteps;
