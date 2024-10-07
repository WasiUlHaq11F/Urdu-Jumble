import React from "react";
import { View, Text, Pressable, Modal } from "react-native";

const GameModal = ({
  isVisible,
  onClose,
  completedWord,
  englishTranslation,
}) => {
  return (
    <>
      <Modal
        transparent={true}
        visible={isVisible}
        animationType="fade"
        style={{ zIndex: 2 }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View className="bg-white p-5 w-320 h-320 border-1 rounded-lg w-80 h-60 shadow-lg">
            <Text className="text-xl font-bold mb-3 mt-8 text-center">
              {completedWord}
            </Text>
            <Text className="text-lg text-gray-700 text-center">
              Meaning: {englishTranslation}
            </Text>
            <Pressable
              onPress={onClose}
              className="mt-4 bg-red-500 rounded-full p-2"
            >
              <Text className="text-white font-bold text-center">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default GameModal;
