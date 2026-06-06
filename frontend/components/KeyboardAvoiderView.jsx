import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  View
} from 'react-native';

/**
 * KeyboardAvoiderView
 * Terinspirasi dari praktik terbaik komunitas (dev.to).
 * Secara otomatis mematikan behavior="height" di Android karena AndroidManifest
 * sudah menggunakan adjustResize, sehingga menghindari double-padding (whitespace).
 */
const KeyboardAvoiderView = ({
  children,
  style,
  offset = 0,
  useScrollView = false,
  contentContainerStyle
}) => {
  const content = useScrollView ? (
    <ScrollView
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  ) : (
    children
  );

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? offset : 0}
    >
      {content}
    </KeyboardAvoidingView>
  );
};

export default KeyboardAvoiderView;
