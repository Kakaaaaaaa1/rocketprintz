
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../firebase/config";

import PlanningUI, {
  PlanningStatus,
  PlanningUIItem,
  PlanningUIOperator,
  PlanningUIOrder,
} from "../../components/ui/planning-ui";

// Mengubah Date menjadi teks YYYY-MM-DD
// berdasarkan tanggal lokal perangkat.
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Mengubah teks YYYY-MM-DD menjadi Date lokal
// (pukul 00.00 waktu perangkat).
const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
};

export default function PlanningPage() {
  const { width } = useWindowDimensions();

  const [planning, setPlanning] =
    useState<PlanningUIItem[]>([]);

  const [orders, setOrders] =
    useState<PlanningUIOrder[]>([]);

  const [operators, setOperators] =
    useState<PlanningUIOperator[]>([]);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [orderId, setOrderId] =
    useState("");

  const [machine, setMachine] =
    useState("");

  const [operatorId, setOperatorId] =
    useState("");

  const [scheduledDate, setScheduledDate] =
    useState(new Date());

  const [status, setStatus] =
    useState<PlanningStatus>("planned");

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [activePicker, setActivePicker] =
    useState<
      "order" |
      "machine" |
      "operator" |
      "status" |
      null
    >(null);

  // ====================================================
  // FIREBASE
  // ====================================================

  useEffect(() => {
    const unsubPlanning = onSnapshot(
      collection(db, "planning"),
      (snapshot) => {
        const data =
          snapshot.docs.map((item) => ({
            id: item.id,
            ...(item.data() as Omit<
              PlanningUIItem,
              "id"
            >),
          }));

        setPlanning(data);
      }
    );

    const unsubOrders = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const data =
          snapshot.docs.map((item) => ({
            id: item.id,
            ...(item.data() as Omit<
              PlanningUIOrder,
              "id"
            >),
          }));

        setOrders(data);
      }
    );

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const data =
          snapshot.docs
            .map((item) => ({
              id: item.id,
              ...(item.data() as Omit<
                PlanningUIOperator,
                "id"
              >),
            }))
            .filter(
              (user) =>
                user.role ===
                "operator"
            );

        setOperators(data);
      }
    );

    return () => {
      unsubPlanning();
      unsubOrders();
      unsubUsers();
    };
  }, []);

  // ====================================================
  // ORDER YANG BELUM MEMILIKI PLANNING
  // ====================================================

  const availableOrders =
    useMemo(() => {
      return orders.filter(
        (order) => {
          if (editingId) {
            const current =
              planning.find(
                (item) =>
                  item.id ===
                  editingId
              );

            if (
              current?.orderId ===
              order.id
            ) {
              return true;
            }
          }

          return !planning.some(
            (item) =>
              item.orderId ===
              order.id
          );
        }
      );
    }, [
      orders,
      planning,
      editingId,
    ]);

  // ====================================================
  // DATA PLANNING DENGAN DATA ORDER TERBARU
  // Data order dan nama operator diambil dari koleksi
  // orders dan users agar ikut berubah ketika diedit.
  // ====================================================

  const planningView =
    useMemo(() => {
      return planning.map((item) => {
        const order = orders.find(
          (o) => o.id === item.orderId
        );

        const operator = operators.find(
          (op) => op.id === item.operatorId
        );

        return {
          ...item,
          orderCode:
            order?.orderCode ?? item.orderCode,
          customerName:
            order?.customerName ?? item.customerName,
          product:
            order?.product ?? item.product,
          quantity:
            order?.quantity ?? item.quantity,
          operatorName:
            operator?.name ?? item.operatorName,
        };
      });
    }, [planning, orders, operators]);

  // ====================================================
  // SELECTED
  // ====================================================

  const selectedOrder =
    orders.find(
      (item) =>
        item.id === orderId
    );

  const selectedOperator =
    operators.find(
      (item) =>
        item.id === operatorId
    );

  // ====================================================
  // RESET
  // ====================================================

  const resetForm = () => {
    setEditingId(null);
    setOrderId("");
    setMachine("");
    setOperatorId("");
    setScheduledDate(parseLocalDate(formatLocalDate(new Date())));
    setStatus("planned");
    setShowDatePicker(false);
    setActivePicker(null);
  };

  // ====================================================
  // TAMBAH
  // ====================================================

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  // ====================================================
  // TUTUP MODAL
  // ====================================================

  const closeModal = () => {
    resetForm();
    setModalVisible(false);
  };

  // ====================================================
  // SIMPAN
  // ====================================================

  const savePlanning = async () => {
    if (!orderId) {
      Alert.alert(
        "Validasi",
        "Silakan pilih order."
      );
      return;
    }

    if (!machine) {
      Alert.alert(
        "Validasi",
        "Silakan pilih mesin."
      );
      return;
    }

    if (!operatorId) {
      Alert.alert(
        "Validasi",
        "Silakan pilih operator."
      );
      return;
    }

    if (!selectedOrder) {
      Alert.alert(
        "Error",
        "Order tidak ditemukan."
      );
      return;
    }

    try {
      // ================================================
      // CEGAH DUPLICATE
      // ================================================

      if (!editingId) {
        const duplicate =
          planning.some(
            (item) =>
              item.orderId ===
              orderId
          );

        if (duplicate) {
          Alert.alert(
            "Planning Sudah Ada",
            "Order ini sudah memiliki planning dan tidak dapat ditambahkan lagi."
          );

          return;
        }
      }

      const data = {
        orderId,

        // Snapshot order
        orderCode:
          selectedOrder.orderCode ??
          "",

        customerName:
          selectedOrder.customerName,

        product:
          selectedOrder.product,

        quantity:
          selectedOrder.quantity,

        machine,

        operatorId,

        operatorName:
          selectedOperator?.name ??
          "",

        // Format tanggal lokal (YYYY-MM-DD) agar
        // tidak bergeser karena zona waktu WIB
        scheduledDate:
          formatLocalDate(
            scheduledDate
          ),

        status,

        updatedAt:
          serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(
            db,
            "planning",
            editingId
          ),
          data
        );
      } else {
        await addDoc(
          collection(
            db,
            "planning"
          ),
          {
            ...data,
            createdAt:
              serverTimestamp(),
          }
        );
      }

      closeModal();

    } catch (error) {
      console.error(
        "Save planning error:",
        error
      );

      Alert.alert(
        "Error",
        "Gagal menyimpan planning."
      );
    }
  };

  // ====================================================
  // EDIT
  // ====================================================

  const editPlanning = (
    item: PlanningUIItem
  ) => {
    setEditingId(item.id);
    setOrderId(item.orderId);
    setMachine(item.machine);
    setOperatorId(
      item.operatorId
    );

    setScheduledDate(
      item.scheduledDate
        ? parseLocalDate(
            item.scheduledDate
          )
        : new Date()
    );

    setStatus(item.status);

    setActivePicker(null);
    setShowDatePicker(false);
    setModalVisible(true);
  };

  // ====================================================
  // DELETE
  // ====================================================

  const deletePlanning = (
    id: string
  ) => {
    const remove = async () => {
      try {
        await deleteDoc(
          doc(
            db,
            "planning",
            id
          )
        );
      } catch (error) {
        console.error(
          error
        );

        Alert.alert(
          "Error",
          "Gagal menghapus planning."
        );
      }
    };

    if (
      Platform.OS === "web"
    ) {
      if (
        window.confirm(
          "Hapus planning ini?"
        )
      ) {
        remove();
      }
    } else {
      Alert.alert(
        "Hapus Planning",
        "Apakah Anda yakin ingin menghapus planning ini?",
        [
          {
            text: "Batal",
            style: "cancel",
          },
          {
            text: "Hapus",
            style: "destructive",
            onPress: remove,
          },
        ]
      );
    }
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          "#f8fafc",
      }}
    >
      <PlanningUI
        width={width}

        planning={planningView}
        availableOrders={
          availableOrders
        }
        operators={operators}

        modalVisible={
          modalVisible
        }

        editingId={editingId}

        orderId={orderId}
        machine={machine}
        operatorId={operatorId}
        scheduledDate={
          scheduledDate
        }
        status={status}

        showDatePicker={
          showDatePicker
        }

        activePicker={
          activePicker
        }

        selectedOrder={
          selectedOrder
        }

        selectedOperator={
          selectedOperator
        }

        openAddModal={
          openAddModal
        }

        closeModal={
          closeModal
        }

        editPlanning={
          editPlanning
        }

        deletePlanning={
          deletePlanning
        }

        savePlanning={
          savePlanning
        }

        setOrderId={
          setOrderId
        }

        setMachine={
          setMachine
        }

        setOperatorId={
          setOperatorId
        }

        setScheduledDate={
          setScheduledDate
        }

        setStatus={
          setStatus
        }

        setShowDatePicker={
          setShowDatePicker
        }

        setActivePicker={
          setActivePicker
        }
      />
    </SafeAreaView>
  );
}
